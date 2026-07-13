import { GoogleGenAI, Type } from "@google/genai";
import { LearnerProfile, AssessmentAnswer, Question } from "../types";
import { QUESTION_BANK } from "../data/questions";

// Initialize Gemini safely.
// We lazily instantiate to prevent crashes on startup if the key is missing,
// as instructed in the "Dependency Errors & Startup Crash Prevention" guide.
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY environment variable is not configured. Falling back to local deterministic engine.");
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
 * Returns a deterministic fallback analysis if Gemini is unavailable or fails.
 */
export function getFallbackProfile(
  goal: string,
  claimedSkills: string[],
  score: number,
  incorrectConcepts: string[]
): LearnerProfile {
  const current_level = score >= 80 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner";
  
  const strengths = claimedSkills.filter((s) => !incorrectConcepts.includes(s));
  if (strengths.length === 0) {
    strengths.push(claimedSkills[0] || "General Programming");
  }

  const skill_gaps = incorrectConcepts.map((concept) => ({
    concept,
    reason: `Your diagnostic answers highlighted a conceptual mismatch in ${concept}, showing a need for revision before proceeding.`,
  }));

  if (skill_gaps.length === 0) {
    skill_gaps.push({
      concept: "Advanced Applications",
      reason: "To achieve your goal of " + goal + ", you should bridge basic concepts with hands-on projects.",
    });
  }

  const prerequisite_gaps = incorrectConcepts.length > 0 
    ? incorrectConcepts 
    : ["Practical Project Architectures", "System Tuning"];

  return {
    current_level,
    strengths,
    skill_gaps,
    prerequisite_gaps,
    personalization_reasoning: `Based on your diagnostic score of ${score}%, you have demonstrated a solid baseline in ${strengths.join(", ")}, but your profile reveals clear prerequisite gaps in ${prerequisite_gaps.join(", ")}. LearnPilot has updated your Study GPS route to address these mathematical and conceptual gaps before moving to advanced layers.`,
  };
}

/**
 * Evaluates the learner profile using the Gemini API.
 */
export async function generateLearnerProfile(
  goal: string,
  claimedSkills: string[],
  answers: AssessmentAnswer[],
  score: number,
  dailyLearningMinutes: number,
  learningStyle: string
): Promise<LearnerProfile> {
  // 1. Identify incorrect concepts from answers
  const incorrectConcepts: string[] = [];
  answers.forEach((ans) => {
    const question = QUESTION_BANK.find((q) => q.id === ans.question_id);
    if (question && question.correctAnswer !== ans.selected_answer) {
      incorrectConcepts.push(question.concept);
    }
  });

  const ai = getGeminiClient();
  if (!ai) {
    return getFallbackProfile(goal, claimedSkills, score, incorrectConcepts);
  }

  try {
    const prompt = `
      You are the structural reasoning engine of LearnPilot AI OS. Your job is to analyze a student's current skill profile and identify gaps. Do not use motivational language or fluff.

      Student Details:
      - Learning Destination Goal: "${goal}"
      - Claimed Skills: ${JSON.stringify(claimedSkills)}
      - Diagnostic Score: ${score}% (out of 100)
      - Incorrect Concepts in Diagnostic: ${JSON.stringify(incorrectConcepts)}
      - Daily Learning Time Commitment: ${dailyLearningMinutes} minutes
      - Preferred Learning Style: "${learningStyle}"

      Perform a rigorous, objective skill analysis.
      Determine:
      1. Their current estimated level (Beginner, Intermediate, or Advanced).
      2. Strengths (skills they claimed that were verified or are logical baselines).
      3. Precise skill gaps (concepts they need to master to reach their goal).
      4. Prerequisite gaps (crucial missing mathematical or architectural prerequisites highlighted by their claimed skills and diagnostic failures).
      5. A clear, customized, 2-3 sentence personalization explanation of why their roadmap is designed this way. Reference their diagnostic score and key gaps.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the structural reasoning engine of LearnPilot AI OS. Analyze skills, find prerequisites, and return JSON. Be direct and accurate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current_level: {
              type: Type.STRING,
              description: "The calculated skill level (e.g. Beginner, Intermediate, Advanced)",
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Verified or logical strengths",
            },
            skill_gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["concept", "reason"],
              },
              description: "List of gaps with explicit reasons why they hold back the goal",
            },
            prerequisite_gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Prerequisite items that need to be learned first",
            },
            personalization_reasoning: {
              type: Type.STRING,
              description: "A compact, highly professional explanation of why their route is personalized.",
            },
          },
          required: [
            "current_level",
            "strengths",
            "skill_gaps",
            "prerequisite_gaps",
            "personalization_reasoning",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(text) as LearnerProfile;
    return parsed;
  } catch (error) {
    console.error("Gemini API call failed, using high-fidelity fallback:", error);
    return getFallbackProfile(goal, claimedSkills, score, incorrectConcepts);
  }
}
