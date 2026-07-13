import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Question, 
  AssessmentAnswer, 
  LearnerProfile, 
  KnowledgeGraph, 
  StudyGPS, 
  WorkspaceState 
} from "../types";
import { CAREER_TRACKS } from "../data/templates";
import { QUESTION_BANK } from "../data/questions";

interface LearningContextType {
  step: "landing" | "onboarding" | "assessment" | "processing" | "workspace" | "my-routes";
  goal: string;
  claimedSkills: string[];
  dailyLearningMinutes: number;
  learningStyle: "visual" | "reading" | "hands-on" | "mixed";
  assessmentQuestions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, number>;
  learnerProfile: LearnerProfile | null;
  knowledgeGraph: KnowledgeGraph | null;
  studyGPS: StudyGPS | null;
  score: number | null;
  weakConcepts: string[];
  verifiedSkills: string[];
  selectedNodeId: string | null;
  isDemoMode: boolean;
  isLoading: boolean;
  errorMsg: string | null;
  learnerId: string | null;
  journeyProgress: number;
  
  // Auth & Theme states
  user: { name: string; email: string } | null;
  isAuthenticated: boolean;
  theme: "light" | "dark";
  
  setStep: (step: "landing" | "onboarding" | "assessment" | "processing" | "workspace" | "my-routes") => void;
  startOnboarding: () => void;
  submitOnboarding: (goal: string, skills: string[], time: number, style: "visual" | "reading" | "hands-on" | "mixed") => Promise<void>;
  submitAnswer: (questionId: string, optionIndex: number) => void;
  prevQuestion: () => void;
  nextQuestion: () => void;
  submitAssessment: () => Promise<void>;
  finishProcessing: () => void;
  completeNode: (nodeId: string) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  resetAll: () => void;
  initializeDemoMode: () => void;
  restoreRoute: (learnerId: string) => Promise<void>;
  registerRoute: (learnerId: string, goal: string) => void;
  updateRouteActivity: (learnerId: string) => void;
  
  // Auth & Theme actions
  signup: (name: string, email: string) => void;
  login: (email: string) => boolean;
  logout: () => void;
  toggleTheme: () => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<"landing" | "onboarding" | "assessment" | "processing" | "workspace" | "my-routes">("landing");
  const [goal, setGoal] = useState<string>("");
  const [claimedSkills, setClaimedSkills] = useState<string[]>([]);
  const [dailyLearningMinutes, setDailyLearningMinutes] = useState<number>(60);
  const [learningStyle, setLearningStyle] = useState<"visual" | "reading" | "hands-on" | "mixed">("mixed");
  
  // Auth and Theme states
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem("guidely_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("guidely_auth") === "true";
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("guidely_theme");
    return (saved as "light" | "dark") || "dark";
  });

  // Sync theme class to documentElement
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("guidely_theme", theme);
  }, [theme]);
  
  const [assessmentQuestions, setAssessmentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(null);
  const [studyGPS, setStudyGPS] = useState<StudyGPS | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [learnerId, setLearnerId] = useState<string | null>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("learnpilot_os_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStep(parsed.step);
        setGoal(parsed.goal);
        setClaimedSkills(parsed.claimedSkills);
        setDailyLearningMinutes(parsed.dailyLearningMinutes);
        setLearningStyle(parsed.learningStyle);
        setAssessmentQuestions(parsed.assessmentQuestions || []);
        setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
        setAnswers(parsed.answers || {});
        setLearnerProfile(parsed.learnerProfile);
        setKnowledgeGraph(parsed.knowledgeGraph);
        setStudyGPS(parsed.studyGPS);
        setScore(parsed.score);
        setWeakConcepts(parsed.weakConcepts || []);
        setVerifiedSkills(parsed.verifiedSkills || []);
        setSelectedNodeId(parsed.selectedNodeId);
        setIsDemoMode(parsed.isDemoMode || false);
        setLearnerId(parsed.learnerId || `learner_${Math.random().toString(36).substring(2, 11)}`);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    } else {
      setLearnerId(`learner_${Math.random().toString(36).substring(2, 11)}`);
    }
  }, []);

  // Sync state to local storage on changes
  useEffect(() => {
    if (step === "landing" && !goal) {
      localStorage.removeItem("learnpilot_os_state");
      return;
    }
    const state = {
      step,
      goal,
      claimedSkills,
      dailyLearningMinutes,
      learningStyle,
      assessmentQuestions,
      currentQuestionIndex,
      answers,
      learnerProfile,
      knowledgeGraph,
      studyGPS,
      score,
      weakConcepts,
      verifiedSkills,
      selectedNodeId,
      isDemoMode,
      learnerId
    };
    localStorage.setItem("learnpilot_os_state", JSON.stringify(state));
  }, [
    step, goal, claimedSkills, dailyLearningMinutes, learningStyle, 
    assessmentQuestions, currentQuestionIndex, answers, learnerProfile, 
    knowledgeGraph, studyGPS, score, weakConcepts, verifiedSkills, selectedNodeId, isDemoMode, learnerId
  ]);

  const startOnboarding = () => {
    setGoal("");
    setClaimedSkills([]);
    setDailyLearningMinutes(60);
    setLearningStyle("mixed");
    setAssessmentQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setLearnerProfile(null);
    setKnowledgeGraph(null);
    setStudyGPS(null);
    setScore(null);
    setWeakConcepts([]);
    setVerifiedSkills([]);
    setSelectedNodeId(null);
    setIsDemoMode(false);
    setErrorMsg(null);
    setLearnerId(`learner_${Math.random().toString(36).substring(2, 11)}`);
    setStep("onboarding");
  };

  const submitOnboarding = async (
    targetGoal: string, 
    skills: string[], 
    time: number, 
    style: "visual" | "reading" | "hands-on" | "mixed"
  ) => {
    setIsLoading(true);
    setErrorMsg(null);
    setGoal(targetGoal);
    setClaimedSkills(skills);
    setDailyLearningMinutes(time);
    setLearningStyle(style);
    
    try {
      const activeLearnerId = learnerId || `learner_${Math.random().toString(36).substring(2, 11)}`;
      if (!learnerId) {
        setLearnerId(activeLearnerId);
      }
      
      const response = await fetch("/api/assessment/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: targetGoal, claimed_skills: skills, learner_id: activeLearnerId })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.learner_id) {
        setLearnerId(data.learner_id);
      }
      setAssessmentQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setStep("assessment");
    } catch (e: any) {
      console.error("Error loading questions from backend:", e);
      setErrorMsg(e.message || "Failed to load dynamic diagnostic questions from the server.");
      // Remain on onboarding step so user can see error message
      setStep("onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitAssessment = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setStep("processing");

    const answersPayload = Object.keys(answers).map(qId => ({
      question_id: qId,
      selected_answer: answers[qId]
    }));

    try {
      const activeLearnerId = learnerId || `learner_${Math.random().toString(36).substring(2, 11)}`;
      if (!learnerId) {
        setLearnerId(activeLearnerId);
      }

      const response = await fetch("/api/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          claimed_skills: claimedSkills,
          answers: answersPayload,
          daily_learning_time: dailyLearningMinutes,
          learning_style: learningStyle,
          learner_id: activeLearnerId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Evaluation failed with status ${response.status}`);
      }

      const data = await response.json();
      setScore(data.assessment.score);
      setWeakConcepts(data.assessment.weak_concepts || []);
      setVerifiedSkills(data.assessment.verified_skills || []);
      setLearnerProfile(data.learner_profile);
      setKnowledgeGraph(data.knowledge_graph);
      setStudyGPS(data.study_gps);
      const finalLearnerId = data.learner_id || activeLearnerId;
      if (data.learner_id) {
        setLearnerId(data.learner_id);
      }
      
      // Register route in local metadata
      registerRoute(finalLearnerId, goal);
      
      // Auto-select first active node
      if (data.knowledge_graph?.nodes) {
        const activeNode = data.knowledge_graph.nodes.find((n: any) => n.status === "active") || data.knowledge_graph.nodes[0];
        setSelectedNodeId(activeNode?.id || null);
      }
    } catch (e: any) {
      console.error("Evaluation failed:", e);
      setErrorMsg(e.message || "Failed to evaluate assessment and generate your learning route map.");
    } finally {
      setIsLoading(false);
    }
  };

  const setupLocalDemoState = (answersPayload: { question_id: string; selected_answer: number }[]) => {
    let correctCount = 0;
    const graded = answersPayload.map(ans => {
      const original = QUESTION_BANK.find(q => q.id === ans.question_id);
      const isCorrect = original ? original.correctAnswer === ans.selected_answer : false;
      if (isCorrect) correctCount++;
      return {
        id: ans.question_id,
        concept: original?.concept || "",
        skill: original?.skill || "",
        isCorrect
      };
    });

    const calculatedScore = Math.round((correctCount / (assessmentQuestions.length || 1)) * 100);
    const incorrect = graded.filter(g => !g.isCorrect).map(g => g.concept);
    const verified = graded.filter(g => g.isCorrect).map(g => g.skill);

    setScore(calculatedScore);
    setWeakConcepts(incorrect);
    setVerifiedSkills(verified);

    // Pick base track
    const goalLower = goal.toLowerCase();
    let trackKey = "ai_engineer";
    if (goalLower.includes("dsa") || goalLower.includes("placement") || goalLower.includes("interview") || goalLower.includes("algorithm")) {
      trackKey = "dsa_prep";
    } else if (goalLower.includes("web") || goalLower.includes("full") || goalLower.includes("stack") || goalLower.includes("developer")) {
      trackKey = "full_stack";
    }

    const baseTrack = CAREER_TRACKS[trackKey] || CAREER_TRACKS.ai_engineer;
    const clonedGraph: KnowledgeGraph = JSON.parse(JSON.stringify(baseTrack.graph));

    // Override node status based on incorrect diagnostic concepts
    clonedGraph.nodes = clonedGraph.nodes.map(node => {
      const isIncorrect = incorrect.some(
        ic => ic.toLowerCase().includes(node.label.toLowerCase()) || node.label.toLowerCase().includes(ic.toLowerCase())
      );
      const isVerified = verified.some(
        v => v.toLowerCase() === node.id || node.id.includes(v.toLowerCase())
      );

      if (isIncorrect) {
        node.status = "missing";
        node.whyRecommended = `Highlighted as a conceptual gap in your diagnostic assessment (Score: ${calculatedScore}%). Master this to clear the path.`;
      } else if (isVerified && node.id !== "linear-algebra" && node.id !== "machine-learning") {
        node.status = "mastered";
      }
      return node;
    });

    // Solve dependencies
    solveGraphLocalDependencies(clonedGraph);

    // Build GPS
    const activeNode = clonedGraph.nodes.find(n => n.status === "active") || clonedGraph.nodes[0];
    const available = clonedGraph.nodes.filter(n => n.status === "available" && n.id !== activeNode.id).map(n => n.id);
    const locked = clonedGraph.nodes.filter(n => n.status === "locked").map(n => n.id);

    const estDays = Math.max(5, Math.round((clonedGraph.nodes.reduce((sum, n) => n.status !== "mastered" ? sum + n.estimatedHours : sum, 0) / (dailyLearningMinutes / 60))));

    const profile: LearnerProfile = {
      current_level: calculatedScore >= 80 ? "Advanced" : calculatedScore >= 50 ? "Intermediate" : "Beginner",
      strengths: verified.length > 0 ? verified : ["Foundations"],
      skill_gaps: incorrect.map(ic => ({ concept: ic, reason: "Identified gap in test diagnostics." })),
      prerequisite_gaps: incorrect,
      personalization_reasoning: `Your diagnostic scored ${calculatedScore}%. We've identified key conceptual gaps in ${incorrect.join(", ") || "mathematical prerequisites"} and locked dependent nodes. Complete current steps to unlock the remaining route.`
    };

    setLearnerProfile(profile);
    setKnowledgeGraph(clonedGraph);
    setStudyGPS({
      current_node_id: activeNode.id,
      next_node_ids: [...available, ...locked].slice(0, 3),
      reason: activeNode.whyRecommended || profile.personalization_reasoning,
      estimated_days: estDays
    });
    setSelectedNodeId(activeNode.id);
  };

  const solveGraphLocalDependencies = (graph: KnowledgeGraph) => {
    const size = graph.nodes.length;
    for (let i = 0; i < size; i++) {
      let altered = false;
      graph.nodes.forEach(node => {
        if (node.status === "mastered" || node.status === "missing") return;

        const allDone = node.prerequisites.every(pId => {
          const pNode = graph.nodes.find(n => n.id === pId);
          return pNode ? pNode.status === "mastered" : true;
        });

        let nextSt = node.status;
        if (allDone) {
          if (node.status === "locked") {
            nextSt = "available";
            altered = true;
          }
        } else {
          nextSt = "locked";
        }
        node.status = nextSt as any;
      });
      if (!altered) break;
    }

    const hasActive = graph.nodes.some(n => n.status === "active");
    if (!hasActive) {
      const firstAvail = graph.nodes.find(n => n.status === "available" || n.status === "missing");
      if (firstAvail) {
        firstAvail.status = "active";
      } else {
        const firstUnfinished = graph.nodes.find(n => n.status !== "mastered");
        if (firstUnfinished) firstUnfinished.status = "active";
      }
    }
  };

  const finishProcessing = () => {
    setStep("workspace");
  };

  const completeNode = async (nodeId: string) => {
    if (!knowledgeGraph) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      console.log(`[Context] Requesting server node completion for: ${nodeId}`);
      const response = await fetch("/api/node/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learner_id: learnerId,
          concept_id: nodeId,
          daily_learning_time: dailyLearningMinutes
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Complete node request failed on backend");
      }

      const data = await response.json();
      if (data.knowledge_graph) {
        setKnowledgeGraph(data.knowledge_graph);
        setStudyGPS(data.study_gps);
        
        // Auto-select the new active node
        const activeNode = data.knowledge_graph.nodes.find((n: any) => n.status === "active") || data.knowledge_graph.nodes[0];
        setSelectedNodeId(activeNode?.id || null);
        
        // Update activity timestamp!
        if (learnerId) {
          updateRouteActivity(learnerId);
        }
        return;
      }
    } catch (err: any) {
      console.error("Node completion failed:", err);
      setErrorMsg(err.message || "Failed to complete concept node.");
    } finally {
      setIsLoading(false);
    }
  };

  const registerRoute = (lId: string, routeGoal: string) => {
    if (!lId || !routeGoal) return;
    const routesJson = localStorage.getItem("guidely_routes");
    let routes = routesJson ? JSON.parse(routesJson) : [];
    
    const existingIndex = routes.findIndex((r: any) => r.learnerId === lId);
    const now = new Date().toISOString();
    if (existingIndex > -1) {
      routes[existingIndex] = {
        ...routes[existingIndex],
        goal: routeGoal,
        lastActivityAt: now
      };
    } else {
      const newRoute = {
        routeId: lId,
        learnerId: lId,
        goal: routeGoal,
        createdAt: now,
        lastActivityAt: now
      };
      routes.push(newRoute);
    }
    localStorage.setItem("guidely_routes", JSON.stringify(routes));
  };

  const updateRouteActivity = (lId: string) => {
    if (!lId) return;
    const routesJson = localStorage.getItem("guidely_routes");
    if (!routesJson) return;
    let routes = JSON.parse(routesJson);
    const existingIndex = routes.findIndex((r: any) => r.learnerId === lId);
    if (existingIndex > -1) {
      routes[existingIndex].lastActivityAt = new Date().toISOString();
      localStorage.setItem("guidely_routes", JSON.stringify(routes));
    }
  };

  const restoreRoute = async (restoredLearnerId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setStep("processing");

    try {
      const response = await fetch(`/api/route/${restoredLearnerId}?dailyMinutes=${dailyLearningMinutes}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Restoration failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Update lastActivityAt in metadata registry
      registerRoute(restoredLearnerId, data.goal || "My Learning Route");

      // Set the active states
      setLearnerId(restoredLearnerId);
      setGoal(data.goal || "My Learning Route");
      setKnowledgeGraph(data.knowledge_graph);
      setStudyGPS(data.study_gps);
      setLearnerProfile(data.learner_profile);
      
      // Clear answers/questions from old assessment
      setAssessmentQuestions([]);
      setAnswers({});
      setScore(null);
      
      // Auto-select active node
      if (data.knowledge_graph?.nodes) {
        const activeNode = data.knowledge_graph.nodes.find((n: any) => n.status === "active") || data.knowledge_graph.nodes[0];
        setSelectedNodeId(activeNode?.id || null);
      }

      setStep("workspace");
    } catch (e: any) {
      console.error("[ROUTE RESTORE ERROR]", e);
      setErrorMsg(e.message || "Failed to restore this learning route.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const selectNode = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  const resetAll = () => {
    setStep("landing");
    setGoal("");
    setClaimedSkills([]);
    setDailyLearningMinutes(60);
    setLearningStyle("mixed");
    setAssessmentQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setLearnerProfile(null);
    setKnowledgeGraph(null);
    setStudyGPS(null);
    setScore(null);
    setWeakConcepts([]);
    setVerifiedSkills([]);
    setSelectedNodeId(null);
    setIsDemoMode(false);
    setErrorMsg(null);
    setLearnerId(`learner_${Math.random().toString(36).substring(2, 11)}`);
    localStorage.removeItem("learnpilot_os_state");
  };

  const initializeDemoMode = () => {
    const demoLearnerId = `learner_demo_${Math.random().toString(36).substring(2, 11)}`;
    setLearnerId(demoLearnerId);
    setGoal("Become an AI Research Engineer");
    setClaimedSkills(["Python", "NumPy", "Basic DSA"]);
    setDailyLearningMinutes(60);
    setLearningStyle("mixed");
    
    // Set up dummy authenticated user if none exists so they get greeted nicely
    if (!user) {
      const demoUser = { name: "Aditya", email: "aditya@guidely.io" };
      setUser(demoUser);
      setIsAuthenticated(true);
      localStorage.setItem("guidely_user", JSON.stringify(demoUser));
      localStorage.setItem("guidely_auth", "true");
    }
    
    // Simulate assessment
    setScore(80);
    setWeakConcepts(["Matrix Operations", "Probability Fundamentals"]);
    setVerifiedSkills(["Python", "NumPy Basics"]);
    
    const baseTrack = CAREER_TRACKS.ai_engineer;
    const clonedGraph: KnowledgeGraph = JSON.parse(JSON.stringify(baseTrack.graph));
    
    // Set up diagnostic failures and mastery
    clonedGraph.nodes = clonedGraph.nodes.map(node => {
      if (node.id === "python" || node.id === "numpy") {
        node.status = "mastered";
      } else if (node.id === "linear-algebra") {
        node.status = "missing"; // gap detected!
        node.whyRecommended = "Your Python knowledge is verified, but your diagnostic identified matrix operations as a prerequisite gap.";
      }
      return node;
    });

    solveGraphLocalDependencies(clonedGraph);
    
    const activeNode = clonedGraph.nodes.find(n => n.id === "linear-algebra") || clonedGraph.nodes[0];
    const available = clonedGraph.nodes.filter(n => n.status === "available" && n.id !== activeNode.id).map(n => n.id);
    const locked = clonedGraph.nodes.filter(n => n.status === "locked").map(n => n.id);
    
    setLearnerProfile({
      current_level: "Beginner-Intermediate",
      strengths: ["Python Fundamentals", "Basic NumPy"],
      skill_gaps: [
        { concept: "Linear Algebra", reason: "Required for understanding machine learning operations" }
      ],
      prerequisite_gaps: ["Matrix Operations", "Probability Fundamentals"],
      personalization_reasoning: "The learner has verified programming fundamentals but lacks mathematical prerequisites for machine learning."
    });
    
    setKnowledgeGraph(clonedGraph);
    setStudyGPS({
      current_node_id: activeNode.id,
      next_node_ids: [...available, ...locked].slice(0, 3),
      reason: "Linear Algebra is recommended because your diagnostic showed strong Python skills but a prerequisite gap before Machine Learning.",
      estimated_days: 14
    });
    
    // Register route in local metadata
    registerRoute(demoLearnerId, "Become an AI Research Engineer");
    
    setSelectedNodeId(activeNode.id);
    setIsDemoMode(true);
    setStep("workspace");
  };

  const signup = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("guidely_user", JSON.stringify(newUser));
    localStorage.setItem("guidely_auth", "true");
    
    const usersJson = localStorage.getItem("guidely_registered_users") || "[]";
    const users = JSON.parse(usersJson);
    if (!users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      users.push({ name, email });
      localStorage.setItem("guidely_registered_users", JSON.stringify(users));
    }
  };

  const login = (email: string): boolean => {
    const usersJson = localStorage.getItem("guidely_registered_users") || "[]";
    const users = JSON.parse(usersJson);
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem("guidely_user", JSON.stringify(foundUser));
      localStorage.setItem("guidely_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("guidely_user");
    localStorage.removeItem("guidely_auth");
    resetAll();
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Calculate journey progress dynamically based on 5% onboarding + 5% assessment + 90% mastery
  const totalConceptsCount = knowledgeGraph?.nodes?.length || 0;
  const masteredConceptsCount = knowledgeGraph?.nodes?.filter(n => n.status === "mastered").length || 0;
  const routeSetupProgress = goal ? 5 : 0;
  const assessmentProgress = score !== null ? 5 : 0;
  const conceptMasteryProgress = totalConceptsCount > 0 
    ? (masteredConceptsCount / totalConceptsCount) * 90 
    : 0;
  const journeyProgress = Math.min(100, Math.round(routeSetupProgress + assessmentProgress + conceptMasteryProgress));

  return (
    <LearningContext.Provider value={{
      step, goal, claimedSkills, dailyLearningMinutes, learningStyle,
      assessmentQuestions, currentQuestionIndex, answers, learnerProfile,
      knowledgeGraph, studyGPS, score, weakConcepts, verifiedSkills, selectedNodeId,
      isDemoMode, isLoading, errorMsg, learnerId,
      user, isAuthenticated, theme, journeyProgress,
      setStep, startOnboarding, submitOnboarding, submitAnswer, prevQuestion, nextQuestion,
      submitAssessment, finishProcessing, completeNode, selectNode, resetAll, initializeDemoMode,
      restoreRoute, registerRoute, updateRouteActivity,
      signup, login, logout, toggleTheme
    }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
};
