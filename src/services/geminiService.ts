import { GoogleGenAI, Type } from "@google/genai";
import { LearnerProfile, KnowledgeGraph, KnowledgeNode, KnowledgeEdge, Question } from "../types";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY environment variable is not configured.");
    return null;
  }
  
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

/**
 * Communicates with Gemini to generate a personalized qualitative profile analysis.
 */
export async function generateLearnerProfile(
  goal: string,
  claimedSkills: string[],
  score: number,
  incorrectConcepts: string[],
  dailyMinutes: number,
  style: string
): Promise<LearnerProfile> {
  const ai = getGeminiClient();
  if (!ai) {
    // Return high-fidelity fallback if key is missing
    return {
      current_level: score >= 85 ? "Advanced" : score >= 55 ? "Intermediate" : "Beginner",
      strengths: claimedSkills.length > 0 ? claimedSkills : ["General Aptitude"],
      skill_gaps: incorrectConcepts.map(ic => ({
        concept: ic,
        reason: `Your diagnostic assessment highlighted an immediate conceptual gap in ${ic}.`
      })),
      prerequisite_gaps: incorrectConcepts,
      personalization_reasoning: `Based on your diagnostic score of ${score}%, we have generated a personalized Study GPS pathway targeting your prerequisite gaps in ${incorrectConcepts.join(", ") || "fundamental engineering concepts"}.`
    };
  }

  try {
    const prompt = `
      You are the structural reasoning engine of LearnPilot AI OS. Your job is to analyze a student's current skill profile and identify gaps. Do not use motivational language or fluff.

      Student Details:
      - Learning Destination Goal: "${goal}"
      - Claimed Skills: ${JSON.stringify(claimedSkills)}
      - Diagnostic Score: ${score}% (out of 100)
      - Incorrect Concepts in Diagnostic: ${JSON.stringify(incorrectConcepts)}
      - Daily Learning Time Commitment: ${dailyMinutes} minutes
      - Preferred Learning Style: "${style}"

      Perform a rigorous, objective skill analysis.
      Determine:
      1. Their current estimated level (Beginner, Intermediate, or Advanced).
      2. Strengths (skills they claimed that were verified or are logical baselines).
      3. Precise skill gaps (concepts they need to master to reach their goal).
      4. Prerequisite gaps (crucial missing mathematical or architectural prerequisites highlighted by their claimed skills and diagnostic failures).
      5. A clear, customized, 2-3 sentence personalization explanation of why their roadmap is designed this way. Reference their diagnostic score and key gaps.
    `;

    console.log(`[Gemini] Requesting learner profile analysis for goal: "${goal}"`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the structural reasoning engine of LearnPilot AI OS. Analyze skills, find prerequisites, and return JSON. Be direct and accurate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current_level: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            skill_gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["concept", "reason"]
              }
            },
            prerequisite_gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            personalization_reasoning: { type: Type.STRING }
          },
          required: [
            "current_level",
            "strengths",
            "skill_gaps",
            "prerequisite_gaps",
            "personalization_reasoning"
          ]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini API during profile generation");
    }

    return JSON.parse(response.text.trim()) as LearnerProfile;
  } catch (error) {
    console.error("[Gemini] Profile generation failed, using local fallback", error);
    return {
      current_level: score >= 85 ? "Advanced" : score >= 55 ? "Intermediate" : "Beginner",
      strengths: claimedSkills.length > 0 ? claimedSkills : ["General Aptitude"],
      skill_gaps: incorrectConcepts.map(ic => ({
        concept: ic,
        reason: `Your diagnostic assessment highlighted an immediate conceptual gap in ${ic}.`
      })),
      prerequisite_gaps: incorrectConcepts,
      personalization_reasoning: `Based on your diagnostic score of ${score}%, we have generated a personalized Study GPS pathway targeting your prerequisite gaps in ${incorrectConcepts.join(", ") || "fundamental engineering concepts"}.`
    };
  }
}

/**
 * Uses Gemini to generate 8 to 15 logically connected concepts with prerequisite paths for ANY arbitrary goal.
 * Fulfills constraints: Valid JSON, no graph coordinates, no fabricated URLs.
 */
export async function generateConceptsGraph(
  goal: string,
  verifiedSkills: string[],
  weakConcepts: string[]
): Promise<KnowledgeGraph> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API client is not configured. Real-time personalized graph generation requires a valid GEMINI_API_KEY.");
  }

  const prompt = `
    Analyze this arbitrary learning goal: "${goal}".
    
    Verified Learner Skills (already mastered): ${JSON.stringify(verifiedSkills)}
    Weak Concepts/Gaps (immediately missing prerequisites): ${JSON.stringify(weakConcepts)}

    Generate a complete, coherent, multi-node learning roadmap.
    Guidelines:
    1. Output exactly 8 to 15 concepts logically connected as a Directed Acyclic Graph (DAG) representing the sequence of learning.
    2. The concepts must trace a logical pathway from fundamental baselines to the final goal destination.
    3. Ensure appropriate concepts are connected via prerequisite links. If concept B requires concept A, put the ID of A in B's "prerequisites" array.
    4. Each concept MUST have unique alphanumeric ID slug, clear label, detailed description, estimatedHours (5 to 15 hrs), whyMatters, practiceTask, and optionally a practical project block.
    5. DO NOT generate visual coordinates or positions.
    6. DO NOT fabricate URLs or resources. Simply return the structural dependencies and description details of concepts.
    7. Respect the user's verified skills: make sure the corresponding nodes represent those baselines, but include them so the graph remains complete.
    8. Mark any concepts that relate directly to the weak concepts as important or highly recommended.
  `;

  console.log(`[Gemini] Generating concept dependency graph for goal: "${goal}"`);
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a professional educational curriculum architect and Graph-theoretic reasoning agent. You design highly coherent concept maps (DAGs) of 8-15 nodes for arbitrary learning goals. Return clean structured JSON only.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            description: "List of 8 to 15 concept nodes forming the dependency tree",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique URL-safe alphanumeric slug representing the concept. E.g. 'linear-regression', 'neural-networks'" },
                label: { type: Type.STRING, description: "A concise, user-friendly label" },
                description: { type: Type.STRING, description: "A clear, professional description of what is learned in this concept" },
                estimatedHours: { type: Type.INTEGER, description: "Estimated study hours to complete this concept (5 to 15)" },
                prerequisites: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of other concept IDs that are direct prerequisites for this concept"
                },
                whyMatters: { type: Type.STRING, description: "Detailed statement on why this matters to reach the target goal" },
                practiceTask: { type: Type.STRING, description: "A concrete practical challenge to apply the learning" },
                project: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Title of the project enabled by this concept" },
                    description: { type: Type.STRING, description: "A detailed description of the project" },
                    difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" },
                    estimatedHours: { type: Type.INTEGER, description: "Estimated project hours (3 to 10)" },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Skills applied in this project" }
                  },
                  required: ["title", "description", "difficulty", "estimatedHours", "skills"]
                }
              },
              required: [
                "id", "label", "description", "estimatedHours", "prerequisites", "whyMatters", "practiceTask"
              ]
            }
          }
        },
        required: ["nodes"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to receive structured concept tree from Gemini API");
  }

  const rawJson = JSON.parse(response.text.trim()) as { nodes: any[] };
  
  // Transform and map to KnowledgeGraph structure
  const nodes: KnowledgeNode[] = rawJson.nodes.map(n => {
    // Determine default status
    let status: KnowledgeNode["status"] = "locked";
    
    // Check if matching verified skills
    const matchesVerified = verifiedSkills.some(
      s => s.toLowerCase() === n.id.toLowerCase() || n.id.toLowerCase().includes(s.toLowerCase())
    );
    // Check if matching weak concepts
    const matchesWeak = weakConcepts.some(
      s => s.toLowerCase() === n.id.toLowerCase() || n.id.toLowerCase().includes(s.toLowerCase()) || n.label.toLowerCase().includes(s.toLowerCase())
    );

    if (matchesVerified) {
      status = "mastered";
    } else if (matchesWeak) {
      status = "missing";
    }

    return {
      id: n.id.toLowerCase().trim(),
      label: n.label,
      description: n.description,
      status,
      prerequisites: (n.prerequisites || []).map((p: string) => p.toLowerCase().trim()),
      estimatedHours: Number(n.estimatedHours) || 8,
      whyMatters: n.whyMatters,
      whyRecommended: matchesWeak ? `Prerequisite gap identified: "${n.label}" is critical to repair immediately.` : undefined,
      practiceTask: n.practiceTask,
      project: n.project
    };
  });

  // Extract edges from prerequisites
  const edges: KnowledgeEdge[] = [];
  nodes.forEach(node => {
    node.prerequisites.forEach(prereqId => {
      // Confirm the prerequisite node exists in the generated set to prevent dangling pointers
      const exists = nodes.some(n => n.id === prereqId);
      if (exists) {
        edges.push({
          source: prereqId,
          target: node.id
        });
      }
    });
  });

  // Calculate dynamic available/locked states
  nodes.forEach(node => {
    if (node.status === "mastered" || node.status === "missing") return;
    const allPrereqsMastered = node.prerequisites.every(pId => {
      const pNode = nodes.find(n => n.id === pId);
      return pNode ? pNode.status === "mastered" : true;
    });
    node.status = allPrereqsMastered ? "available" : "locked";
  });

  // Activate the first available or missing node if there isn't one already
  const hasActive = nodes.some(n => n.status === "active");
  if (!hasActive) {
    const candidate = nodes.find(n => n.status === "missing") || nodes.find(n => n.status === "available");
    if (candidate) {
      candidate.status = "active";
    } else {
      const firstUncompleted = nodes.find(n => n.status !== "mastered");
      if (firstUncompleted) firstUncompleted.status = "active";
    }
  }

  console.log(`[Gemini] Dynamic curriculum roadmap built successfully with ${nodes.length} nodes and ${edges.length} edges.`);

  return { nodes, edges };
}

/**
 * Dynamically generates 5 highly customized diagnostic questions based on the user's specific learning goal and claimed skills.
 */
export async function generateDiagnosticQuestions(
  goal: string,
  claimedSkills: string[]
): Promise<Question[]> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API client is not configured. Real-time diagnostic question generation requires a valid GEMINI_API_KEY.");
  }

  const prompt = `
    You are the curriculum design agent of LearnPilot AI OS.
    Generate a set of exactly 5 diagnostic assessment questions tailored for a user aiming to achieve this goal: "${goal}".
    The user claims the following baseline skills: ${JSON.stringify(claimedSkills)}.
    
    The questions must:
    1. Specifically target relevant concepts for "${goal}" (e.g. if the goal is "Become a Quantum Engineer", test quantum computing, qubits, linear algebra, complex numbers; if "Become a Backend Engineer", test APIs, databases, HTTP).
    2. Test both foundational prerequisites (e.g., math, introductory concepts) and intermediate/advanced concepts related to the goal.
    3. Include exactly 4 multiple-choice options for each question.
    4. Have a designated correctAnswer index (0 to 3) representing the index of the correct option in the options array.
    5. Specify difficulty ("Easy", "Medium", "Hard") and categorize by 'skill' and 'concept'.
    6. Return a JSON object with a "questions" array containing these 5 questions.
  `;

  console.log(`[GEMINI] Generating diagnostic for: ${goal}`);

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are an expert diagnostic test designer. Create highly relevant, specialized diagnostic questions for custom technical and engineering disciplines. Return valid JSON only matching the schema.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            description: "List of exactly 5 tailored diagnostic questions",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique alphanumeric question ID (e.g., 'quant_1', 'math_2')" },
                skill: { type: Type.STRING, description: "The overarching skill category (e.g., 'Quantum Computing', 'Linear Algebra')" },
                concept: { type: Type.STRING, description: "The specific sub-concept tested" },
                question: { type: Type.STRING, description: "The actual multiple choice question text" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 distinct plausible options"
                },
                correctAnswer: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array (0 to 3)" },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"], description: "Level of difficulty" }
              },
              required: ["id", "skill", "concept", "question", "options", "correctAnswer", "difficulty"]
            }
          }
        },
        required: ["questions"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to receive structured diagnostic questions from Gemini API");
  }

  const rawJson = JSON.parse(response.text.trim()) as { questions: Question[] };
  console.log(`[GEMINI] Diagnostic generated successfully`);
  return rawJson.questions;
}

