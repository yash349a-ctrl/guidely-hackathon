import { getNeo4jDriver, calculateGraphProgress } from "./neo4jService";
import { StudyGPS } from "../types";

/**
 * Traverses the active learner's graph in Neo4j to retrieve high-fidelity Study GPS state.
 */
export async function getStudyGps(learnerId: string, dailyMinutes: number): Promise<StudyGPS> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const goalId = `goal_${learnerId}`;

  try {
    // 1. Get current active concept being learned
    const activeResult = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:LEARNING]->(c:Concept)
       RETURN c.cleanId AS cleanId, c.label AS label, c.whyRecommended AS whyRecommended, c.whyMatters AS whyMatters`,
      { learnerId }
    );

    let activeNodeId = "";
    let activeLabel = "";
    let reason = "Your customized learning map is loaded. Continue mastering key building blocks to unlock advanced pathways.";

    if (activeResult.records.length > 0) {
      activeNodeId = activeResult.records[0].get("cleanId");
      activeLabel = activeResult.records[0].get("label");
      const whyRecommended = activeResult.records[0].get("whyRecommended");
      const whyMatters = activeResult.records[0].get("whyMatters");
      reason = whyRecommended || whyMatters || `We recommend completing "${activeLabel}" to unlock downstream specialized concepts.`;
    } else {
      // Find the first unmastered concept to assign as active
      const fallbackActive = await session.run(
        `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c:Concept)
         WHERE NOT (l)-[:MASTERED]->(c)
         RETURN c.cleanId AS cleanId, c.label AS label
         ORDER BY c.id ASC
         LIMIT 1`,
        { learnerId, goalId }
      );
      if (fallbackActive.records.length > 0) {
        activeNodeId = fallbackActive.records[0].get("cleanId");
        activeLabel = fallbackActive.records[0].get("label");
        reason = `Let's begin by mastering the first foundational concept: "${activeLabel}".`;
        
        // Persist this active choice in Neo4j so it doesn't float
        const nextConceptDbId = `${learnerId}_${activeNodeId}`;
        await session.run(
          `MATCH (l:Learner {id: $learnerId}), (c:Concept {id: $nextConceptDbId})
           MERGE (l)-[:LEARNING]->(c)`,
          { learnerId, nextConceptDbId }
        );
      }
    }

    // 2. Identify the next best concepts to study (next 3 uncompleted, prioritizing available)
    const nextResult = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c:Concept)
       WHERE NOT (l)-[:MASTERED]->(c) AND c.cleanId <> $activeNodeId
       OPTIONAL MATCH (l)-[w:WEAK_IN]->(c)
       WITH c, CASE WHEN w IS NOT NULL THEN 1 ELSE 0 END AS is_weak
       RETURN c.cleanId AS cleanId
       ORDER BY is_weak DESC, c.id ASC
       LIMIT 3`,
      { learnerId, goalId, activeNodeId }
    );

    const nextNodeIds = nextResult.records.map(rec => rec.get("cleanId"));

    // 3. Calculate remaining estimated days based on uncompleted hours and daily commitment
    const progress = await calculateGraphProgress(learnerId);
    const uncompletedHours = progress.totalHours - progress.completedHours;
    const dailyHours = (dailyMinutes || 60) / 60;
    const estimatedDays = Math.max(1, Math.round(uncompletedHours / dailyHours));

    console.log(`[StudyGPS] Tracked active concept: "${activeNodeId}" with estimated days remaining: ${estimatedDays}`);

    return {
      current_node_id: activeNodeId || "done",
      next_node_ids: nextNodeIds,
      reason,
      estimated_days: estimatedDays
    };
  } finally {
    await session.close();
  }
}
