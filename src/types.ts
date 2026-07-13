export interface Question {
  id: string;
  skill: string;
  concept: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface AssessmentAnswer {
  question_id: string;
  selected_answer: number;
}

export interface LearnerProfile {
  current_level: string;
  strengths: string[];
  skill_gaps: {
    concept: string;
    reason: string;
  }[];
  prerequisite_gaps: string[];
  personalization_reasoning: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  description: string;
  status: "mastered" | "active" | "available" | "missing" | "locked";
  prerequisites: string[];
  estimatedHours: number;
  whyMatters?: string;
  whyRecommended?: string;
  practiceTask?: string;
  project?: {
    title: string;
    description: string;
    difficulty: string;
    estimatedHours: number;
    skills: string[];
  };
}

export interface KnowledgeEdge {
  source: string;
  target: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface StudyGPS {
  current_node_id: string;
  next_node_ids: string[];
  reason: string;
  estimated_days: number;
}

export interface LearningResource {
  id: string;
  conceptId: string;
  title: string;
  provider: string;
  type: "video" | "documentation" | "article" | "practice";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  url: string;
}

export interface WorkspaceState {
  goal: string;
  claimedSkills: string[];
  dailyLearningMinutes: number;
  learningStyle: "visual" | "reading" | "hands-on" | "mixed";
  learnerProfile: LearnerProfile;
  knowledgeGraph: KnowledgeGraph;
  studyGPS: StudyGPS;
}
