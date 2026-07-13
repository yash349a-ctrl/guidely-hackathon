import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { QUESTION_BANK } from "./src/data/questions";
import { CAREER_TRACKS } from "./src/data/templates";
import { Question, AssessmentAnswer, LearnerProfile, KnowledgeGraph, StudyGPS } from "./src/types";

// Import Neo4j and Gemini Services
import { 
  getNeo4jDriver, 
  saveKnowledgeGraph, 
  getLearnerGraph, 
  markConceptMastered,
  calculateGraphProgress
} from "./src/services/neo4jService";
import { 
  generateLearnerProfile, 
  generateConceptsGraph,
  generateDiagnosticQuestions
} from "./src/services/geminiService";
import { 
  getStudyGps 
} from "./src/services/studyGpsService";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory cache for dynamic assessment questions keyed by learner_id
const generatedQuestionsMap = new Map<string, Question[]>();

// In-memory data store for fallback mode (when Neo4j/Gemini are absent or fail)
const inMemoryGraphs = new Map<string, KnowledgeGraph>();
const inMemoryProfiles = new Map<string, LearnerProfile>();
const inMemoryStudyGPS = new Map<string, StudyGPS>();

let isNeo4jConnected = false;

// Helper to calculate StudyGPS locally
function getLocalStudyGps(graph: KnowledgeGraph, dailyMinutes: number, reason: string): StudyGPS {
  const activeNode = graph.nodes.find(n => n.status === "active") || graph.nodes[0];
  const available = graph.nodes.filter(n => n.status === "available" && n.id !== activeNode.id).map(n => n.id);
  const locked = graph.nodes.filter(n => n.status === "locked").map(n => n.id);

  const uncompletedHours = graph.nodes.reduce((sum, n) => n.status !== "mastered" ? sum + n.estimatedHours : sum, 0);
  const dailyHours = (dailyMinutes || 60) / 60;
  const estimatedDays = Math.max(1, Math.round(uncompletedHours / dailyHours));

  return {
    current_node_id: activeNode ? activeNode.id : "done",
    next_node_ids: [...available, ...locked].slice(0, 3),
    reason: activeNode ? (activeNode.whyRecommended || reason) : "Congratulations! You have mastered all concepts on this path.",
    estimated_days: estimatedDays
  };
}


// API Endpoints

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Fetch questions based on goals and claimed skills
app.post("/api/assessment/questions", async (req, res) => {
  try {
    const { goal, claimed_skills, learner_id } = req.body as { goal: string; claimed_skills: string[]; learner_id?: string };
    
    if (!goal) {
      return res.status(400).json({ error: "Goal is required" });
    }

    const activeLearnerId = learner_id || `learner_${Math.random().toString(36).substring(2, 11)}`;
    
    console.log(`[ONBOARDING] Goal received: ${goal}`);
    
    let questions: Question[];
    let usedFallback = false;
    try {
      // Generate diagnostic questions dynamically using Gemini SDK
      questions = await generateDiagnosticQuestions(goal, claimed_skills || []);
    } catch (geminiError: any) {
      console.warn("[ONBOARDING WARNING] Dynamic Gemini generation failed, falling back to local question bank:", geminiError.message || geminiError);
      usedFallback = true;
      // Get matching questions from static bank
      const skillsLower = (claimed_skills || []).map((s) => s.toLowerCase().trim());
      let matched = QUESTION_BANK.filter((q) => 
        skillsLower.includes(q.skill.toLowerCase())
      );
      if (matched.length < 5) {
        const remaining = QUESTION_BANK.filter((q) => !matched.some((mq) => mq.id === q.id));
        matched = [...matched, ...remaining].slice(0, 5);
      } else {
        matched = matched.slice(0, 5);
      }
      questions = matched;
    }
    
    // Store questions (which contain correct answers) in cache for grading later
    generatedQuestionsMap.set(activeLearnerId, questions);
    
    // Security/Integrity: Strip correct answers before sending to client
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      skill: q.skill,
      concept: q.concept,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }));
    
    res.json({ questions: safeQuestions, learner_id: activeLearnerId, isDemoMode: usedFallback });
  } catch (error: any) {
    console.error("[ONBOARDING ERROR] Failed to retrieve questions:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve questions" });
  }
});

// 3. Evaluate diagnostic answers and synthesize Learner Profile & Knowledge Graph
app.post("/api/assessment/evaluate", async (req, res) => {
  try {
    const { goal, claimed_skills, answers, daily_learning_time, learning_style, learner_id } = req.body as {
      goal: string;
      claimed_skills: string[];
      answers: AssessmentAnswer[];
      daily_learning_time: number;
      learning_style: "visual" | "reading" | "hands-on" | "mixed";
      learner_id?: string;
    };

    const claimed = claimed_skills || [];
    const answersList = answers || [];
    const dailyMinutes = daily_learning_time || 60;
    const style = learning_style || "mixed";

    // Generate/Reuse learner ID
    const learnerId = learner_id || `learner_${Math.random().toString(36).substring(2, 11)}`;

    console.log(`[ASSESSMENT] Answers received`);

    // Calculate Score & identify gaps using the cached questions in generatedQuestionsMap or QUESTION_BANK fallback
    const learnerQuestions = generatedQuestionsMap.get(learnerId) || [];
    let correctCount = 0;
    const gradedAnswers = answersList.map((ans) => {
      const question = learnerQuestions.find((q) => q.id === ans.question_id) || QUESTION_BANK.find((q) => q.id === ans.question_id);
      const isCorrect = question ? question.correctAnswer === ans.selected_answer : false;
      if (isCorrect) correctCount++;
      return {
        question_id: ans.question_id,
        concept: question?.concept || "General",
        skill: question?.skill || "General",
        isCorrect,
      };
    });

    const totalQuestions = answersList.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);

    const incorrectConcepts = gradedAnswers
      .filter((ga) => !ga.isCorrect)
      .map((ga) => ga.concept);

    const verifiedSkills = gradedAnswers
      .filter((ga) => ga.isCorrect)
      .map((ga) => ga.skill);

    let profile: LearnerProfile;
    let graph: KnowledgeGraph;
    let studyGPS: StudyGPS;
    let isRealPipeline = true;

    try {
      if (!isNeo4jConnected) {
        throw new Error("Neo4j database is not connected (bypassed dynamic pipeline to prevent long timeout hangs)");
      }

      // 1. Try Gemini generation
      console.log(`[GEMINI] Generating learner profile`);
      profile = await generateLearnerProfile(
        goal,
        claimed,
        score,
        incorrectConcepts,
        dailyMinutes,
        style
      );

      console.log(`[GEMINI] Generating knowledge graph`);
      const genGraph = await generateConceptsGraph(goal, verifiedSkills, incorrectConcepts);
      console.log(`[GEMINI] Knowledge graph generated: ${genGraph.nodes.length} concepts`);

      // 2. Try Neo4j persistence
      console.log(`[NEO4J] Persisting learner graph`);
      await saveKnowledgeGraph(learnerId, goal, genGraph);
      
      const dbGraph = await getLearnerGraph(learnerId);
      if (!dbGraph) {
        throw new Error(`Failed to retrieve persisted learner graph from Neo4j`);
      }
      graph = dbGraph;
      studyGPS = await getStudyGps(learnerId, dailyMinutes);
    } catch (pipelineError: any) {
      console.warn("[EVALUATION WARNING] Dynamic Gemini + Neo4j pipeline failed, compiling high-fidelity local fallback:", pipelineError.message || pipelineError);
      isRealPipeline = false;

      // Construct High-Fidelity Fallback Learner Profile
      profile = {
        current_level: score >= 80 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner",
        strengths: claimed.length > 0 ? claimed : ["Core Aptitude"],
        skill_gaps: incorrectConcepts.map(ic => ({
          concept: ic,
          reason: `Diagnostic score flagged a conceptual gap in ${ic}.`
        })),
        prerequisite_gaps: incorrectConcepts,
        personalization_reasoning: `Your diagnostic score is ${score}%. We've selected a customized study pathway, highlighting immediate gaps in ${incorrectConcepts.join(", ") || "the prerequisite concepts"} and locking down advanced dependent concepts.`
      };

      // Select matching local Career Track templates
      const goalLower = goal.toLowerCase();
      let trackKey = "ai_engineer"; // default
      if (goalLower.includes("dsa") || goalLower.includes("placement") || goalLower.includes("interview") || goalLower.includes("algorithm") || goalLower.includes("structure")) {
        trackKey = "dsa_prep";
      } else if (goalLower.includes("web") || goalLower.includes("full") || goalLower.includes("stack") || goalLower.includes("developer") || goalLower.includes("frontend") || goalLower.includes("backend")) {
        trackKey = "full_stack";
      }

      const selectedTrack = CAREER_TRACKS[trackKey] || CAREER_TRACKS.ai_engineer;
      graph = JSON.parse(JSON.stringify(selectedTrack.graph));

      // Customize node statuses based on user diagnostic results
      graph.nodes = graph.nodes.map((node) => {
        const matchesIncorrect = incorrectConcepts.some(
          (ic) => ic.toLowerCase().includes(node.label.toLowerCase()) || node.label.toLowerCase().includes(ic.toLowerCase()) || ic.toLowerCase().includes(node.id.toLowerCase()) || node.id.toLowerCase().includes(ic.toLowerCase())
        );

        const matchesVerified = verifiedSkills.some(
          (vs) => vs.toLowerCase() === node.id || node.id.includes(vs.toLowerCase()) || vs.toLowerCase().includes(node.label.toLowerCase()) || node.label.toLowerCase().includes(vs.toLowerCase())
        );

        if (matchesIncorrect) {
          node.status = "locked";
          node.whyRecommended = `Your diagnostic assessment highlighted an immediate gap in ${node.label}. Completing this will repair this crucial dependency.`;
        } else if (matchesVerified && node.id !== "linear-algebra" && node.id !== "machine-learning" && node.id !== "deep-learning" && node.id !== "react-framework" && node.id !== "node-express" && node.id !== "arrays-lists" && node.id !== "stacks-queues") {
          node.status = "mastered";
        }

        return node;
      });

      // Solve dependencies using local solver
      recalculateGraphState(graph, profile.personalization_reasoning);

      // Compute Study GPS details locally
      studyGPS = getLocalStudyGps(graph, dailyMinutes, profile.personalization_reasoning);

      // Cache the local state in-memory so node completions and other interactions stay fully stateful!
      inMemoryGraphs.set(learnerId, graph);
      inMemoryProfiles.set(learnerId, profile);
      inMemoryStudyGPS.set(learnerId, studyGPS);
    }

    res.json({
      assessment: {
        score,
        verified_skills: Array.from(new Set(verifiedSkills)),
        weak_concepts: Array.from(new Set(incorrectConcepts)),
      },
      learner_profile: profile,
      knowledge_graph: graph,
      study_gps: studyGPS,
      learner_id: learnerId,
      isRealNeo4j: isRealPipeline
    });
  } catch (error: any) {
    console.error("[EVALUATION ERROR] Dynamic Neo4j + Gemini pipeline failed:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate assessment" });
  }
});

// 4. Mark node complete and persist update to Neo4j database
app.post("/api/node/complete", async (req, res) => {
  try {
    const { learner_id, concept_id, daily_learning_time } = req.body as {
      learner_id: string;
      concept_id: string;
      daily_learning_time: number;
    };

    if (!learner_id || !concept_id) {
      return res.status(400).json({ error: "Missing learner_id or concept_id in request body" });
    }

    const dailyMinutes = daily_learning_time || 60;
    
    console.log(`[Node Complete] Processing node completion for user: ${learner_id}, node: ${concept_id}`);
    
    try {
      if (!isNeo4jConnected) {
        throw new Error("Neo4j database is not connected (bypassed dynamic pipeline to prevent long timeout hangs)");
      }
      // Try to use Neo4j
      await markConceptMastered(learner_id, concept_id);
      const graph = await getLearnerGraph(learner_id);
      const studyGPS = await getStudyGps(learner_id, dailyMinutes);

      return res.json({
        knowledge_graph: graph,
        study_gps: studyGPS,
        isRealNeo4j: true
      });
    } catch (neoError: any) {
      console.warn("[NODE COMPLETE WARNING] Neo4j update failed, updating in-memory state:", neoError.message || neoError);
      
      // Fallback to in-memory graph
      let graph = inMemoryGraphs.get(learner_id);
      if (!graph) {
        // Create matching local graph from templates as a last-resort recovery
        const trackKey = "ai_engineer";
        graph = JSON.parse(JSON.stringify(CAREER_TRACKS[trackKey].graph));
        inMemoryGraphs.set(learner_id, graph);
      }

      // Mark target node as mastered
      const targetNode = graph!.nodes.find((n) => n.id === concept_id);
      if (targetNode) {
        targetNode.status = "mastered";
      }

      // De-activate old node if we want to solve dependency
      graph!.nodes.forEach((n) => {
        if (n.status === "active" && n.id === concept_id) {
          n.status = "mastered";
        }
      });

      // Solve/recalculate remaining node states
      recalculateGraphState(graph!, "Recalculating following concept completion.");

      const studyGPS = getLocalStudyGps(graph!, dailyMinutes, "Your customized learning map has been updated dynamically.");
      
      // Update our cache
      inMemoryGraphs.set(learner_id, graph!);
      inMemoryStudyGPS.set(learner_id, studyGPS);

      return res.json({
        knowledge_graph: graph,
        study_gps: studyGPS,
        isRealNeo4j: false
      });
    }
  } catch (error: any) {
    console.error("[NODE COMPLETE ERROR] Failed to complete concept node:", error);
    res.status(500).json({ error: error.message || "Failed to complete concept node" });
  }
});

// 5. Restore/Fetch existing learning route state
app.get("/api/route/:learnerId", async (req, res) => {
  try {
    const { learnerId } = req.params;
    const dailyMinutes = Number(req.query.dailyMinutes) || 60;

    if (!learnerId) {
      return res.status(400).json({ error: "learnerId is required" });
    }

    console.log(`[ROUTE RESTORE] Attempting to restore route for learner: ${learnerId}`);

    let graph: KnowledgeGraph | null = null;
    let studyGPS: StudyGPS | null = null;
    let profile: LearnerProfile | null = null;
    let goalTitle = "";

    // 1. Try Neo4j
    if (isNeo4jConnected) {
      try {
        graph = await getLearnerGraph(learnerId);
        if (graph) {
          studyGPS = await getStudyGps(learnerId, dailyMinutes);
          
          // Get the goal title from Neo4j
          const driver = getNeo4jDriver();
          const session = driver.session();
          try {
            const goalId = `goal_${learnerId}`;
            const goalCheck = await session.run(
              `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId}) RETURN g.title AS title`,
              { learnerId, goalId }
            );
            if (goalCheck.records.length > 0) {
              goalTitle = goalCheck.records[0].get("title") || "";
            }
          } finally {
            await session.close();
          }
        }
      } catch (neoErr) {
        console.warn(`[ROUTE RESTORE] Neo4j read failed for learner ${learnerId}:`, neoErr);
      }
    }

    // 2. Try Fallback in-memory maps
    if (!graph) {
      graph = inMemoryGraphs.get(learnerId) || null;
      if (graph) {
        studyGPS = inMemoryStudyGPS.get(learnerId) || getLocalStudyGps(graph, dailyMinutes, "Restored in-memory learning path.");
        profile = inMemoryProfiles.get(learnerId) || null;
      }
    }

    if (!graph) {
      console.warn(`[MY ROUTES] Persisted graph not found for learner: ${learnerId}`);
      return res.status(404).json({ error: `Learning route not found for learner ID ${learnerId}` });
    }

    // If profile is not found, construct a default one
    if (!profile) {
      profile = {
        current_level: "Intermediate",
        strengths: ["Foundations"],
        skill_gaps: [],
        prerequisite_gaps: [],
        personalization_reasoning: "Restored from database state."
      };
    }

    res.json({
      knowledge_graph: graph,
      study_gps: studyGPS,
      learner_profile: profile,
      goal: goalTitle || "My Learning Route",
      learner_id: learnerId
    });

  } catch (error: any) {
    console.error("[ROUTE RESTORE ERROR] Failed to restore learning route:", error);
    res.status(500).json({ error: error.message || "Failed to restore learning route" });
  }
});

// 6. Fetch live metadata summaries for a list of saved route learner IDs
app.post("/api/routes/summaries", async (req, res) => {
  try {
    const { learnerIds } = req.body as { learnerIds: string[] };
    if (!learnerIds || !Array.isArray(learnerIds)) {
      return res.status(400).json({ error: "learnerIds array is required" });
    }

    const summaries = [];

    for (const lId of learnerIds) {
      try {
        let graph: KnowledgeGraph | null = null;
        let isRealNeo4j = false;

        // 1. Try to fetch from Neo4j
        if (isNeo4jConnected) {
          try {
            graph = await getLearnerGraph(lId);
            if (graph) {
              isRealNeo4j = true;
            }
          } catch (neoErr) {
            console.warn(`[MY ROUTES] Neo4j read failed for learner ${lId}:`, neoErr);
          }
        }

        // 2. Try fallback in-memory map
        if (!graph) {
          graph = inMemoryGraphs.get(lId) || null;
        }

        if (!graph) {
          console.warn(`[MY ROUTES] Persisted graph not found for learner: ${lId}`);
          summaries.push({
            learnerId: lId,
            error: "Graph not found"
          });
          continue;
        }

        // Calculate concepts
        const totalConcepts = graph.nodes.length;
        const masteredConcepts = graph.nodes.filter(n => n.status === "mastered").length;
        const progressPercentage = totalConcepts > 0 ? Math.min(100, Math.max(0, Math.round((masteredConcepts / totalConcepts) * 100))) : 0;

        let routeStatus = "IN PROGRESS";
        if (progressPercentage === 100) {
          routeStatus = "COMPLETED";
        } else if (masteredConcepts > 0) {
          routeStatus = "PARTIALLY COMPLETED";
        }

        // Find current step label
        let currentStepId = "";
        let currentStepLabel = "";

        // Look for active status node
        const activeNode = graph.nodes.find(n => n.status === "active");
        if (activeNode) {
          currentStepId = activeNode.id;
          currentStepLabel = activeNode.label;
        } else {
          // Look for any unmastered node
          const uncompleted = graph.nodes.find(n => n.status !== "mastered");
          if (uncompleted) {
            currentStepId = uncompleted.id;
            currentStepLabel = uncompleted.label;
          } else {
            currentStepLabel = "All completed";
          }
        }

        summaries.push({
          learnerId: lId,
          totalConcepts,
          masteredConcepts,
          progressPercentage,
          routeStatus,
          currentStepId,
          currentStepLabel,
          isRealNeo4j
        });

      } catch (err: any) {
        console.error(`[MY ROUTES] Error summarizing route for ${lId}:`, err);
        summaries.push({
          learnerId: lId,
          error: err.message || "Failed to calculate summary"
        });
      }
    }

    res.json({ summaries });
  } catch (error: any) {
    console.error("[MY ROUTES ERROR] Summaries fetch failed:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve summaries" });
  }
});

// Helper function to dynamically evaluate dependencies and statuses of nodes
function recalculateGraphState(graph: KnowledgeGraph, defaultReason: string) {
  const maxIterations = graph.nodes.length;
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    graph.nodes.forEach((node) => {
      if (node.status === "mastered" || node.status === "missing") {
        return;
      }

      const prereqs = node.prerequisites;
      const allPrereqsMastered = prereqs.every((prereqId) => {
        const prereqNode = graph.nodes.find((n) => n.id === prereqId);
        return prereqNode ? prereqNode.status === "mastered" : true;
      });

      let nextStatus = node.status;
      if (allPrereqsMastered) {
        if (node.status === "locked") {
          nextStatus = "available";
        }
      } else {
        nextStatus = "locked";
      }

      if (nextStatus !== node.status) {
        node.status = nextStatus as any;
        changed = true;
      }
    });

    if (!changed) break;
  }

  const activeNodeExists = graph.nodes.some((n) => n.status === "active");
  if (!activeNodeExists) {
    const candidate = graph.nodes.find((n) => n.status === "available" || n.status === "missing");
    if (candidate) {
      candidate.status = "active";
    } else {
      const uncompleted = graph.nodes.find((n) => n.status !== "mastered");
      if (uncompleted) {
        uncompleted.status = "active";
      }
    }
  }
}

// Serve the complete static site or mount Vite dev server
async function startServer() {
  // Verify Neo4j connectivity on startup
  try {
    const driver = getNeo4jDriver();
    await driver.verifyConnectivity();
    isNeo4jConnected = true;
    console.log("[NEO4J] Connection successful");
  } catch (error: any) {
    isNeo4jConnected = false;
    console.error(`[NEO4J ERROR] ${error.message || error}`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LearnPilot server listening on port ${PORT}`);
  });
}

startServer();
