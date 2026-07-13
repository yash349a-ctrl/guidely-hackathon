import neo4j, { Driver } from "neo4j-driver";
import { KnowledgeGraph, KnowledgeNode, KnowledgeEdge, LearningResource, StudyGPS } from "../types";

let driverInstance: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (driverInstance) return driverInstance;

  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    console.error("CRITICAL: Missing Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD).");
    throw new Error("Neo4j database credentials are not fully configured in the server environment.");
  }

  driverInstance = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password)
  );
  return driverInstance;
}

/**
 * Creates a Learner node in Neo4j if it doesn't already exist.
 */
export async function createLearner(learnerId: string): Promise<void> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  try {
    console.log(`[Neo4j] Ensuring Learner node exists for ID: ${learnerId}`);
    await session.run(
      `MERGE (l:Learner {id: $learnerId}) RETURN l`,
      { learnerId }
    );
  } finally {
    await session.close();
  }
}

/**
 * Creates a Goal node and associates it with the Learner.
 */
export async function createGoal(learnerId: string, goalTitle: string): Promise<string> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  // Unique goal ID scoped to learner to prevent collision across anonymous users
  const goalId = `goal_${learnerId}`;
  try {
    console.log(`[Neo4j] Setting up Goal: "${goalTitle}" for Learner: ${learnerId}`);
    await session.run(
      `MATCH (l:Learner {id: $learnerId})
       MERGE (g:Goal {id: $goalId})
       SET g.title = $goalTitle
       MERGE (l)-[:TARGETS]->(g)
       RETURN g`,
      { learnerId, goalId, goalTitle }
    );
    return goalId;
  } finally {
    await session.close();
  }
}

/**
 * Saves a full synthesized KnowledgeGraph structure into Neo4j AuraDB.
 * Each Concept node is prefixed with learnerId to partition data.
 */
export async function saveKnowledgeGraph(
  learnerId: string,
  goalTitle: string,
  graph: KnowledgeGraph
): Promise<void> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const goalId = `goal_${learnerId}`;

  try {
    console.log(`[Neo4j] Writing full graph for Goal: "${goalTitle}" for Learner: ${learnerId}`);
    
    // 1. Ensure Learner & Goal exist and are linked
    await session.run(
      `MERGE (l:Learner {id: $learnerId})
       MERGE (g:Goal {id: $goalId})
       SET g.title = $goalTitle
       MERGE (l)-[:TARGETS]->(g)`,
      { learnerId, goalId, goalTitle }
    );

    // 2. Clear out any previous concept & project nodes for this specific learner to prevent ghost nodes
    await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal)-[rel:HAS_CONCEPT]->(c:Concept)
       OPTIONAL MATCH (c)-[pr:ENABLES_PROJECT]->(p:Project)
       OPTIONAL MATCH (c)-[hr:HAS_RESOURCE]->(r:Resource)
       DETACH DELETE c, p, r`,
      { learnerId }
    );

    // 3. Insert new Concepts and Projects
    for (const node of graph.nodes) {
      const dbConceptId = `${learnerId}_${node.id}`;
      
      // Create Concept
      await session.run(
        `MATCH (g:Goal {id: $goalId})
         MERGE (c:Concept {id: $dbConceptId})
         SET c.cleanId = $cleanId,
             c.label = $label,
             c.description = $description,
             c.estimatedHours = $estimatedHours,
             c.whyMatters = $whyMatters,
             c.whyRecommended = $whyRecommended,
             c.practiceTask = $practiceTask
         MERGE (g)-[:HAS_CONCEPT]->(c)`,
        {
          goalId,
          dbConceptId,
          cleanId: node.id,
          label: node.label,
          description: node.description,
          estimatedHours: Number(node.estimatedHours) || 8,
          whyMatters: node.whyMatters || "",
          whyRecommended: node.whyRecommended || "",
          practiceTask: node.practiceTask || ""
        }
      );

      // Create Project if present
      if (node.project) {
        const projectId = `proj_${dbConceptId}`;
        await session.run(
          `MATCH (c:Concept {id: $dbConceptId})
           MERGE (p:Project {id: $projectId})
           SET p.title = $title,
               p.description = $description,
               p.difficulty = $difficulty,
               p.estimatedHours = $estimatedHours,
               p.skills = $skills
           MERGE (c)-[:ENABLES_PROJECT]->(p)`,
          {
            dbConceptId,
            projectId,
            title: node.project.title,
            description: node.project.description,
            difficulty: node.project.difficulty,
            estimatedHours: Number(node.project.estimatedHours) || 5,
            skills: node.project.skills || []
          }
        );
      }

      // Establish initial state relationship with Learner
      if (node.status === "mastered") {
        await session.run(
          `MATCH (l:Learner {id: $learnerId}), (c:Concept {id: $dbConceptId})
           MERGE (l)-[:MASTERED]->(c)`,
          { learnerId, dbConceptId }
        );
      } else if (node.status === "active") {
        await session.run(
          `MATCH (l:Learner {id: $learnerId}), (c:Concept {id: $dbConceptId})
           MERGE (l)-[:LEARNING]->(c)`,
          { learnerId, dbConceptId }
        );
      } else if (node.status === "missing") {
        await session.run(
          `MATCH (l:Learner {id: $learnerId}), (c:Concept {id: $dbConceptId})
           MERGE (l)-[:WEAK_IN]->(c)`,
          { learnerId, dbConceptId }
        );
      }
    }

    // 4. Create Concept to Concept relationships (REQUIRES, LEADS_TO)
    for (const edge of graph.edges) {
      const sourceDbId = `${learnerId}_${edge.source}`;
      const targetDbId = `${learnerId}_${edge.target}`;

      await session.run(
        `MATCH (s:Concept {id: $sourceDbId}), (t:Concept {id: $targetDbId})
         MERGE (t)-[:REQUIRES]->(s)
         MERGE (s)-[:LEADS_TO]->(t)`,
        { sourceDbId, targetDbId }
      );
    }

    console.log(`[Neo4j] Graph successfully persisted to AuraDB for user: ${learnerId}`);
  } finally {
    await session.close();
  }
}

/**
 * Retrieves the full knowledge graph and status details for a learner.
 */
export async function getLearnerGraph(learnerId: string): Promise<KnowledgeGraph | null> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const goalId = `goal_${learnerId}`;

  try {
    // Check if goal exists
    const goalCheck = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId}) RETURN g.title AS title`,
      { learnerId, goalId }
    );
    if (goalCheck.records.length === 0) {
      return null;
    }

    // Fetch Concepts, connected Projects, and state details
    const nodesResult = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c:Concept)
       OPTIONAL MATCH (c)-[:ENABLES_PROJECT]->(p:Project)
       RETURN c, p,
              exists((l)-[:MASTERED]->(c)) AS isMastered,
              exists((l)-[:LEARNING]->(c)) AS isActive,
              exists((l)-[:WEAK_IN]->(c)) AS isWeak`,
      { learnerId, goalId }
    );

    // Fetch prerequisite edges
    const edgesResult = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c1:Concept)
       MATCH (c1)-[:LEADS_TO]->(c2:Concept)
       WHERE (g)-[:HAS_CONCEPT]->(c2)
       RETURN c1.cleanId AS source, c2.cleanId AS target`,
      { learnerId, goalId }
    );

    const nodes: KnowledgeNode[] = [];

    for (const rec of nodesResult.records) {
      const c = rec.get("c").properties;
      const pRecord = rec.get("p");
      const isMastered = rec.get("isMastered");
      const isActive = rec.get("isActive");
      const isWeak = rec.get("isWeak");

      const cleanId = c.cleanId;

      // Determine standard structural status
      let status: KnowledgeNode["status"] = "locked";
      if (isMastered) {
        status = "mastered";
      } else if (isActive) {
        status = "active";
      } else if (isWeak) {
        status = "missing";
      }

      // We will solve dynamic 'available'/'locked' statuses in the post-processing phase or via prerequisite query.
      const project = pRecord ? {
        title: pRecord.properties.title,
        description: pRecord.properties.description,
        difficulty: pRecord.properties.difficulty,
        estimatedHours: Number(pRecord.properties.estimatedHours) || 5,
        skills: pRecord.properties.skills || []
      } : undefined;

      nodes.push({
        id: cleanId,
        label: c.label,
        description: c.description,
        status,
        prerequisites: [], // populated below
        estimatedHours: Number(c.estimatedHours) || 8,
        whyMatters: c.whyMatters,
        whyRecommended: c.whyRecommended,
        practiceTask: c.practiceTask,
        project
      });
    }

    const edges: KnowledgeEdge[] = edgesResult.records.map(rec => ({
      source: rec.get("source"),
      target: rec.get("target")
    }));

    // Populate prerequisites for nodes based on edges
    nodes.forEach(node => {
      node.prerequisites = edges
        .filter(edge => edge.target === node.id)
        .map(edge => edge.source);
    });

    // Solve for "available" / "locked" statuses dynamically based on prerequisite mastery
    nodes.forEach(node => {
      if (node.status === "mastered" || node.status === "missing" || node.status === "active") {
        return;
      }
      const allPrereqsMastered = node.prerequisites.every(pId => {
        const pNode = nodes.find(n => n.id === pId);
        return pNode ? pNode.status === "mastered" : true;
      });
      node.status = allPrereqsMastered ? "available" : "locked";
    });

    return { nodes, edges };
  } finally {
    await session.close();
  }
}

/**
 * Finds all concepts that are available to learn (all prerequisites mastered, but not yet mastered).
 */
export async function findAvailableConcepts(learnerId: string): Promise<string[]> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const goalId = `goal_${learnerId}`;

  try {
    const result = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c:Concept)
       WHERE NOT (l)-[:MASTERED]->(c)
       AND ALL(req IN [(c)-[:REQUIRES]->(p) | p] WHERE (l)-[:MASTERED]->(req))
       RETURN c.cleanId AS cleanId`,
      { learnerId, goalId }
    );
    return result.records.map(rec => rec.get("cleanId"));
  } finally {
    await session.close();
  }
}

/**
 * Finds all uncompleted concepts that have prerequisite gaps (i.e. we are missing required mastered concepts).
 */
export async function findPrerequisiteGaps(learnerId: string): Promise<string[]> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const goalId = `goal_${learnerId}`;

  try {
    const result = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c:Concept)
       WHERE NOT (l)-[:MASTERED]->(c)
       AND ANY(req IN [(c)-[:REQUIRES]->(p) | p] WHERE NOT (l)-[:MASTERED]->(req))
       RETURN c.cleanId AS cleanId`,
      { learnerId, goalId }
    );
    return result.records.map(rec => rec.get("cleanId"));
  } finally {
    await session.close();
  }
}

/**
 * Calculates current progress analytics based on Neo4j relationships.
 */
export async function calculateGraphProgress(learnerId: string): Promise<{
  totalHours: number;
  completedHours: number;
  progressPercentage: number;
}> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const goalId = `goal_${learnerId}`;

  try {
    const result = await session.run(
      `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal {id: $goalId})-[:HAS_CONCEPT]->(c:Concept)
       WITH c, exists((l)-[:MASTERED]->(c)) AS isMastered
       RETURN sum(c.estimatedHours) AS total,
              sum(CASE WHEN isMastered THEN c.estimatedHours ELSE 0 END) AS completed`,
      { learnerId, goalId }
    );

    if (result.records.length === 0) {
      return { totalHours: 0, completedHours: 0, progressPercentage: 0 };
    }

    const record = result.records[0];
    const totalHours = Number(record.get("total")) || 0;
    const completedHours = Number(record.get("completed")) || 0;
    const progressPercentage = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

    return { totalHours, completedHours, progressPercentage };
  } finally {
    await session.close();
  }
}

/**
 * Marks a concept as MASTERED, clears other state relationships, and updates GPS routing state.
 */
export async function markConceptMastered(learnerId: string, conceptId: string): Promise<void> {
  const driver = getNeo4jDriver();
  const session = driver.session();
  const dbConceptId = `${learnerId}_${conceptId}`;

  try {
    console.log(`[Neo4j] Marking concept ${conceptId} as MASTERED for learner ${learnerId}`);
    
    // 1. Set relationship MASTERED and delete LEARNING/WEAK_IN
    await session.run(
      `MATCH (l:Learner {id: $learnerId})
       MATCH (c:Concept {id: $dbConceptId})
       MERGE (l)-[:MASTERED]->(c)
       WITH l, c
       OPTIONAL MATCH (l)-[lr:LEARNING]->(c)
       DELETE lr
       WITH l, c
       OPTIONAL MATCH (l)-[wi:WEAK_IN]->(c)
       DELETE wi`,
      { learnerId, dbConceptId }
    );

    // 2. Clear out any previous LEARNING states on other unmastered concepts so we can route cleanly
    await session.run(
      `MATCH (l:Learner {id: $learnerId})-[lr:LEARNING]->(:Concept)
       DELETE lr`,
      { learnerId }
    );

    // 3. Find newly available concepts
    const available = await findAvailableConcepts(learnerId);
    
    if (available.length > 0) {
      // Find out if any of the available concepts was marked as weak/missing earlier, or select first available
      const selectionResult = await session.run(
        `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal)-[:HAS_CONCEPT]->(c:Concept)
         WHERE c.cleanId IN $available
         OPTIONAL MATCH (l)-[w:WEAK_IN]->(c)
         RETURN c.id AS dbId, c.cleanId AS cleanId
         ORDER BY CASE WHEN w IS NOT NULL THEN 1 ELSE 0 END DESC, c.id ASC
         LIMIT 1`,
        { learnerId, available }
      );

      if (selectionResult.records.length > 0) {
        const nextConceptDbId = selectionResult.records[0].get("dbId");
        const nextConceptCleanId = selectionResult.records[0].get("cleanId");

        console.log(`[Neo4j] Setting next ACTIVE concept to: ${nextConceptCleanId}`);
        await session.run(
          `MATCH (l:Learner {id: $learnerId}), (c:Concept {id: $nextConceptDbId})
           MERGE (l)-[:LEARNING]->(c)`,
          { learnerId, nextConceptDbId }
        );
      }
    } else {
      // If nothing is directly available, but we still have uncompleted concepts, activate the first unmastered one
      const fallbackResult = await session.run(
        `MATCH (l:Learner {id: $learnerId})-[:TARGETS]->(g:Goal)-[:HAS_CONCEPT]->(c:Concept)
         WHERE NOT (l)-[:MASTERED]->(c)
         RETURN c.id AS dbId, c.cleanId AS cleanId
         ORDER BY c.id ASC
         LIMIT 1`,
        { learnerId }
      );

      if (fallbackResult.records.length > 0) {
        const nextConceptDbId = fallbackResult.records[0].get("dbId");
        await session.run(
          `MATCH (l:Learner {id: $learnerId}), (c:Concept {id: $nextConceptDbId})
           MERGE (l)-[:LEARNING]->(c)`,
          { learnerId, nextConceptDbId }
        );
      }
    }
  } finally {
    await session.close();
  }
}
