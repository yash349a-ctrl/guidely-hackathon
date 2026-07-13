<div align="center">

# 🧭 GUIDELY

### AI-Powered Personalized Learning Navigation

**Know where you are. Discover what is missing. Learn exactly what comes next.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express\&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=google\&logoColor=white)](https://ai.google.dev/)
[![Neo4j](https://img.shields.io/badge/Database-Neo4j-4581C3?logo=neo4j\&logoColor=white)](https://neo4j.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js\&logoColor=white)](https://nodejs.org/)

</div>

---

## 📌 About GUIDELY

**GUIDELY** is an AI-powered personalized learning navigation platform designed to answer one of the most difficult questions faced by learners:

> **“What should I learn next?”**

Most online learning platforms provide the same course lists and roadmaps to every learner. However, every learner starts from a different position, has different strengths, lacks different prerequisites, follows a different learning style, and can dedicate a different amount of time each day.

GUIDELY solves this problem by acting like **Google Maps for Learning**.

It identifies the learner’s destination, evaluates their current knowledge, detects missing concepts and prerequisites, creates an interactive knowledge graph, and generates a personalized **Study GPS** route. As the learner completes concepts, GUIDELY updates progress, unlocks dependent topics, and recommends the next best step.

---

## 🎯 Problem Statement

Learners today have access to an enormous amount of educational content, but they still struggle to build an effective learning path.

Common problems include:

* Not knowing which topic to begin with
* Following generic roadmaps that ignore existing knowledge
* Skipping important prerequisite concepts
* Spending time relearning already-mastered skills
* Feeling overwhelmed by scattered online resources
* Losing motivation because progress is difficult to visualize
* Not understanding why a particular concept should be learned next

The real problem is not a lack of content.

The real problem is a lack of **direction, sequencing, and personalization**.

---

## 💡 Our Solution

GUIDELY converts an unstructured learning goal into a personalized and continuously updated learning journey.

The platform:

1. Accepts the learner’s target goal
2. Collects their claimed skills
3. Understands their available daily learning time
4. Considers their preferred learning style
5. Conducts a short diagnostic assessment
6. Verifies strengths and detects weak concepts
7. Identifies missing prerequisites
8. Builds a connected knowledge graph
9. Recommends the single best next concept
10. Updates the learning route after every completed milestone

This creates a guided learning experience instead of another static roadmap.

---

## ✨ Key Features

### 🧠 AI-Generated Diagnostic Assessment

GUIDELY generates targeted diagnostic questions based on the learner’s selected goal and claimed skills.

The assessment helps distinguish between:

* Skills the learner claims to know
* Skills the learner has verified through assessment
* Concepts requiring improvement
* Missing foundational prerequisites

Correct answers are removed from the client response and retained on the server for safer evaluation.

---

### 🔍 Intelligent Skill-Gap Analysis

After the diagnostic assessment, GUIDELY creates a personalized learner profile containing:

* Current learning level
* Verified strengths
* Weak concepts
* Skill gaps
* Prerequisite gaps
* Personalization reasoning
* Recommended learning direction

This allows the generated path to begin from the learner’s actual position rather than from a generic starting point.

---

### 🕸️ Interactive Knowledge Graph

GUIDELY represents the learning journey as a connected graph instead of a plain checklist.

Each node represents a concept and may contain:

* Concept name
* Description
* Prerequisites
* Estimated learning time
* Importance of the concept
* Reason for recommendation
* Practice task
* Suggested project
* Current progress status

Concept nodes can have the following states:

| Status      | Meaning                                                   |
| ----------- | --------------------------------------------------------- |
| `mastered`  | The learner has already completed or verified the concept |
| `active`    | The concept currently recommended by Study GPS            |
| `available` | The learner can begin this concept                        |
| `missing`   | A foundational gap has been detected                      |
| `locked`    | Prerequisites must be completed first                     |

The visual graph helps learners understand how concepts depend on one another.

---

### 🧭 Dynamic Study GPS

Study GPS is the core navigation system of GUIDELY.

It provides:

* The current recommended concept
* The reason that concept should be learned next
* Upcoming concepts
* Estimated completion time
* Remaining learning duration
* Route recalculation after concept completion

When the learner marks a concept as complete, GUIDELY:

1. Marks the node as mastered
2. Rechecks prerequisite relationships
3. Unlocks eligible dependent concepts
4. Selects the next active concept
5. Recalculates the estimated route duration
6. Updates the knowledge graph and Study GPS

---

### 📊 Personalized Learning Workspace

The main workspace brings the entire learning journey into a single interface.

It includes:

* Study GPS route panel
* Interactive knowledge graph
* Concept details panel
* Learner profile
* Skill-gap analysis
* Progress tracking
* Estimated learning duration
* Saved learning routes
* Route restoration
* Concept completion controls

---

### 💾 Persistent Learning Routes

When Neo4j is connected, GUIDELY stores learner goals, concepts, dependencies, progress, and route state inside the graph database.

Learners can:

* Restore an existing learning route
* Continue from their current concept
* Review completed concepts
* View route progress
* Access multiple saved learning journeys

---

### 📱 Responsive Interface

GUIDELY is designed to work across desktop and mobile screen sizes.

The responsive workspace allows learners to access:

* Study GPS
* Knowledge graph
* Concept details
* Progress information
* Route controls

without requiring a desktop-only layout.

---

### 🛡️ Reliable Fallback Mode

A hackathon demo should not completely fail because an external AI service or database is temporarily unavailable.

GUIDELY includes a deterministic local fallback system that can:

* Load diagnostic questions from a local question bank
* Generate a fallback learner profile
* Select a suitable career-track template
* Build a predefined knowledge graph
* Track concept completion in memory
* Unlock dependent concepts
* Recalculate Study GPS
* Restore active in-memory routes during the running session

This keeps the core learning experience functional even when Gemini or Neo4j is unavailable.

---

## 🔄 User Journey

```text
Landing Page
      ↓
Choose Learning Goal
      ↓
Add Existing Skills
      ↓
Select Daily Learning Time
      ↓
Choose Learning Style
      ↓
Complete Diagnostic Assessment
      ↓
AI Skill-Gap Analysis
      ↓
Generate Personalized Knowledge Graph
      ↓
Receive Study GPS Recommendation
      ↓
Open Concept Details
      ↓
Complete Current Concept
      ↓
Unlock Dependencies and Recalculate Route
      ↓
Continue Until Goal Completion
```

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────┐
│           React + TypeScript Client          │
│                                              │
│  Onboarding • Assessment • Workspace • Graph │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API
                       ▼
┌──────────────────────────────────────────────┐
│          Node.js + Express Backend           │
│                                              │
│ Assessment • Evaluation • Route Management   │
└───────────────┬────────────────┬─────────────┘
                │                │
                ▼                ▼
┌──────────────────────┐  ┌──────────────────────┐
│    Google Gemini     │  │     Neo4j AuraDB     │
│                      │  │                      │
│ Questions            │  │ Learner Graph        │
│ Learner Profile      │  │ Dependencies         │
│ Knowledge Graph      │  │ Progress Persistence │
└───────────────┬──────┘  └───────────┬──────────┘
                │                     │
                └──────────┬──────────┘
                           ▼
               ┌──────────────────────┐
               │      Study GPS       │
               │                      │
               │ Next Best Concept    │
               │ Route Recalculation  │
               │ Time Estimation      │
               └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* **React 19** — component-based user interface
* **TypeScript** — type-safe application development
* **Tailwind CSS 4** — responsive styling and design system
* **Motion** — animations and interface transitions
* **Lucide React** — scalable interface icons
* **Vite** — frontend development and production build tooling

### Backend

* **Node.js 22**
* **Express 4**
* **TypeScript**
* **TSX** — TypeScript execution during development
* **Esbuild** — production server bundling
* **Dotenv** — environment-variable configuration

### Artificial Intelligence

* **Google Gemini API**
* **Google GenAI SDK**
* AI-generated diagnostic questions
* Learner-profile generation
* Knowledge-graph generation
* Structured AI responses

### Database

* **Neo4j AuraDB**
* Graph-based concept storage
* Prerequisite relationships
* Learner progress persistence
* Route restoration
* Dynamic dependency updates

### Deployment

* **Render**
* **Render Blueprint**
* Production Express server
* Static Vite frontend hosting

---

## 🔌 API Endpoints

| Method | Endpoint                    | Description                                                                       |
| ------ | --------------------------- | --------------------------------------------------------------------------------- |
| `GET`  | `/api/health`               | Checks whether the backend server is running                                      |
| `POST` | `/api/assessment/questions` | Generates diagnostic questions based on the goal and claimed skills               |
| `POST` | `/api/assessment/evaluate`  | Evaluates answers and creates the learner profile, knowledge graph, and Study GPS |
| `POST` | `/api/node/complete`        | Marks a concept as complete and recalculates the route                            |
| `GET`  | `/api/route/:learnerId`     | Restores a saved learning route                                                   |
| `POST` | `/api/routes/summaries`     | Returns progress summaries for saved routes                                       |

---

## 📡 Example API Requests

### Generate Diagnostic Questions

```http
POST /api/assessment/questions
Content-Type: application/json
```

```json
{
  "goal": "Become an AI Engineer",
  "claimed_skills": ["Python", "NumPy"],
  "learner_id": "learner_demo"
}
```

---

### Evaluate Assessment

```http
POST /api/assessment/evaluate
Content-Type: application/json
```

```json
{
  "goal": "Become an AI Engineer",
  "claimed_skills": ["Python", "NumPy"],
  "answers": [
    {
      "question_id": "python_1",
      "selected_answer": 0
    }
  ],
  "daily_learning_time": 60,
  "learning_style": "mixed",
  "learner_id": "learner_demo"
}
```

---

### Complete a Concept

```http
POST /api/node/complete
Content-Type: application/json
```

```json
{
  "learner_id": "learner_demo",
  "concept_id": "linear-algebra",
  "daily_learning_time": 60
}
```

---

## ⚙️ Local Installation

### Prerequisites

Make sure the following tools are installed:

* Node.js 22 or later
* npm
* Git
* Google Gemini API key
* Neo4j AuraDB database for persistent graph operations

---

### 1. Clone the Repository

```bash
git clone https://github.com/yash349a-ctrl/guidely-hackathon.git
cd guidely-hackathon
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"

NEO4J_URI="neo4j+s://your-database-id.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="your-neo4j-password"
```

> Never commit real API keys, passwords, or database credentials to GitHub.

---

### 4. Start the Development Server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## 📦 Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Run the TypeScript validation command:

```bash
npm run lint
```

---

## ☁️ Deployment on Render

The project includes a `render.yaml` file for Render Blueprint deployment.

### Deployment Steps

1. Push the latest project code to GitHub.
2. Sign in to Render.
3. Select **New +**.
4. Choose **Blueprint**.
5. Connect the `guidely-hackathon` repository.
6. Add the required environment variables:

   * `GEMINI_API_KEY`
   * `APP_URL`
   * `NEO4J_URI`
   * `NEO4J_USERNAME`
   * `NEO4J_PASSWORD`
7. Deploy the service.
8. Open the generated Render URL.
9. Verify the backend using:

```text
https://your-render-url.onrender.com/api/health
```

---

## 📁 Project Structure

```text
guidely-hackathon/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/             # Shared application state
│   ├── data/                # Question bank and fallback career tracks
│   ├── pages/               # Landing, onboarding, assessment and workspace
│   ├── services/            # Gemini, Neo4j and Study GPS services
│   ├── App.tsx              # Main application component
│   ├── types.ts             # Shared TypeScript interfaces
│   └── main.tsx             # React entry point
├── server.ts                # Express server and API routes
├── index.html               # Main HTML entry point
├── package.json             # Dependencies and scripts
├── render.yaml              # Render deployment configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment-variable template
├── .node-version            # Node.js runtime version
└── README.md
```

---

## 🧩 How Route Recalculation Works

Each concept contains a list of prerequisite concept IDs.

When a concept is completed:

1. Its status becomes `mastered`.
2. GUIDELY checks every remaining concept.
3. A locked concept becomes available when all prerequisites are mastered.
4. If no active concept exists, GUIDELY selects an eligible concept.
5. The selected concept becomes `active`.
6. Remaining estimated hours are recalculated.
7. Study GPS generates the updated route information.

This creates a learning path that reacts to learner progress instead of remaining static.

---

## 🏆 Why GUIDELY Is Different

GUIDELY is not simply:

* A course recommendation website
* A static roadmap generator
* A chatbot that lists learning resources
* A basic progress checklist

GUIDELY combines:

* Goal-based onboarding
* Diagnostic assessment
* AI-powered learner analysis
* Prerequisite-gap detection
* Graph-based knowledge representation
* Dynamic next-step recommendations
* Progress-aware route recalculation
* Persistent learning journeys
* Reliable fallback behavior

It does not only tell learners what topics exist.

It tells them:

* Where they currently stand
* What knowledge is missing
* Why a concept matters
* What should be learned next
* Which topics will unlock afterward
* How long the remaining route may take

---

## 🌍 Potential Impact

GUIDELY can help:

* Students preparing for technical careers
* Beginners entering programming or AI
* Learners switching career domains
* Universities creating adaptive learning paths
* Bootcamps personalizing student roadmaps
* Mentors tracking learner progress
* Professionals upskilling for new roles
* Organizations building internal training journeys

The same navigation system can be adapted for technical education, academic subjects, professional certifications, interview preparation, and workforce development.

---

## 🔮 Future Scope

Future versions of GUIDELY can include:

### Learning DNA

Track learning speed, assessment performance, revision behavior, and practice completion to improve future time estimates.

### Knowledge-Decay Prediction

Estimate when previously mastered concepts may be forgotten and automatically recommend revision.

### AI Practice Generator

Generate quizzes, coding exercises, case studies, and mini-projects for every concept.

### AI Interview Simulator

Conduct voice-based or text-based interviews before unlocking advanced concepts.

### Resource Recommendation Engine

Recommend videos, documentation, articles, courses, and practice platforms according to the learner’s preferred style.

### Collaborative Learning Routes

Allow friends, classmates, and teams to follow shared routes while tracking individual progress.

### Mentor Dashboard

Give teachers and mentors a visual overview of learner strengths, gaps, progress, and blocked concepts.

### Portfolio Builder

Turn completed projects and milestones into a shareable learner portfolio.

### Gamification

Add streaks, milestones, achievements, challenges, and progress rewards.

### Multi-Domain Expansion

Support learning routes for:

* Artificial Intelligence
* Data Science
* Full-Stack Development
* DSA and placement preparation
* Cybersecurity
* Cloud Computing
* UI/UX Design
* Academic subjects
* Professional certifications

---

## 🚧 Current Hackathon Scope

This repository represents a hackathon MVP focused on demonstrating the complete personalized-learning workflow:

* Goal onboarding
* Skill collection
* Diagnostic assessment
* Learner-profile generation
* Knowledge-graph generation
* Study GPS navigation
* Concept completion
* Dependency unlocking
* Progress recalculation
* Route persistence and restoration
* Resilient fallback behavior

The architecture is designed so that the MVP can be extended into a larger production learning platform.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add your feature"
```

4. Push the branch:

```bash
git push origin feature/your-feature-name
```

5. Open a pull request.

---

## 🔐 Security Notes

* Gemini API calls are handled on the server.
* Correct diagnostic answers are not returned to the frontend.
* Secrets are loaded using environment variables.
* Real credentials should never be committed.
* Neo4j credentials should only be configured through secure environment settings.

---

## 📄 Project Status

GUIDELY is currently a **hackathon MVP** and is actively being improved.

---

## 👨‍💻 Repository

Source code:

[github.com/yash349a-ctrl/guidely-hackathon](https://github.com/yash349a-ctrl/guidely-hackathon)

---

<div align="center">

## 🧭 GUIDELY

### Stop searching randomly. Start learning with direction.

**Your goal is the destination. GUIDELY builds the route.**

</div>
