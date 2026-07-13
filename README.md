# LearnPilot AI OS
> "Google Maps for Learning" — The Operating System for Personalized Learning.

LearnPilot AI OS is a full-stack, visually rich hackathon MVP that solves the ultimate learner question: **"What should I learn next?"** Rather than generating static course lists or generic AI chatbot responses, LearnPilot maps what the student knows, detects exact conceptual gaps through a Flash Diagnostic, constructs an interactive Knowledge Graph, and pilots them through a dynamic **Study GPS** route.

---

## 🚀 Flagship Experiences

1. **AI Skill Gap Detection**: Seamlessly analyzes student-claimed skills alongside factual diagnostic results. Powered by **Gemini 3.5-Flash** (via the modern `@google/genai` SDK), it extracts qualitative profiles, core strengths, and structural mathematical or architectural prerequisite gaps.
2. **Interactive Knowledge Graph**: The visual focal point of the platform. Designed as a high-fidelity panning and zooming SVG canvas that maps complex dependent nodes and curved connecting links. Nodes represent conceptual milestones with dynamic states (`mastered`, `active`, `available`, `missing`, `locked`).
3. **Study GPS Route Planner**: A vertical navigation system that acts as an active route guide. As concepts are completed, the topological dependency solver automatically propagates progress, unlocks child nodes, and recalculates the single next best step.

---

## 🛠️ Tech Stack & Architecture

LearnPilot is structured as a unified **Full-Stack (TypeScript + React + Express + Vite)** application. By embedding Vite directly into Express as development middleware, the entire app runs as a single, ultra-fast process on **Port 3000** with seamless API-to-client handshakes.

### Backend (Node.js & Express)
* **Express**: Hosts secure API routes and handles full-stack requests.
* **Google GenAI SDK**: Integrates **Gemini 3.5-Flash** server-side with strict structured JSON schemas (`responseSchema`) to prevent API key leakage to the browser.
* **TSX & Esbuild**: Enables seamless TypeScript server execution in development and compiles the server into a bundle in production.

### Frontend (React & Tailwind CSS)
* **React 19**: Powered by functional declarative components and custom state hooks.
* **Tailwind CSS v4**: Uses modern theme definitions, responsive layout controls, and high-tech utility patterns.
* **Motion**: Powers elegant progressive entries and smooth step transitions.
* **Lucide React**: Provides sharp, semantic, clean vector iconography.

---

## 🔄 User Flow State Machine

```
 Landing Page (Hero + Interactive Preview)
       │
       ▼
 Goal Onboarding (Progressive Destination selection, Claimed Skills tagger)
       │
       ▼
 Flash Skill Diagnostic (5 MCQ conceptual questions selected dynamically)
       │
       ▼
 AI Processing Screen (Impressive multi-stage progress calculations)
       │
       ▼
 Unified LearnPilot Workspace (Study GPS Console + Graph Canvas + Inspector Drawer)
```

---

## 📡 API Endpoints (Contracts)

### 1. Retrieve Questions
* **Endpoint**: `POST /api/assessment/questions`
* **Request**:
```json
{
  "goal": "Become an AI Engineer",
  "claimed_skills": ["Python", "NumPy"]
}
```
* **Response**: Returns 5 custom questions with answer indices stripped out for front-end safety.

### 2. Evaluate Assessment
* **Endpoint**: `POST /api/assessment/evaluate`
* **Request**:
```json
{
  "goal": "Become an AI Engineer",
  "claimed_skills": ["Python", "NumPy"],
  "answers": [
    {"question_id": "python_1", "selected_answer": 0}
  ],
  "daily_learning_time": 60,
  "learning_style": "mixed"
}
```
* **Response**: Returns scored diagnostic metrics, Gemini-synthesized learner profile, custom-tailored knowledge graph, and Study GPS coordinates.

---

## 👥 Hackathon Team & Responsibilities

For the purpose of our 3-member team workspace, responsibilities are cleanly decoupled:
* **Member 1 (AI & Product Integration)**: Responsible for server-side `gemini.ts` configuration, prompt design, JSON-schema structures, and fallback demo mock integration.
* **Member 2 (Frontend & UI/UX)**: Responsible for the visual interactive canvas, custom SVG curve drawings, panning/zooming calculations, step animations, and the contextual drawer.
* **Member 3 (Backend & Database)**: Responsible for `server.ts` express endpoints, static asset directories, full-stack compilation configurations, and routing states.

---

## 💻 Local Setup & Execution

<div align="center">

# 🧭 GUIDELY

### AI-powered learning navigation that shows you exactly what to learn next

**“Google Maps for Learning”**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_AI-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Neo4j](https://img.shields.io/badge/Database-Neo4j-4581C3?logo=neo4j&logoColor=white)](https://neo4j.com/)

</div>

---

## 🌟 Overview

**GUIDELY** is a personalized AI learning navigator designed to answer one of the most confusing questions learners face:

> **“What should I learn next?”**

Most learning platforms provide generic course lists, fixed roadmaps, or chatbot-style suggestions. GUIDELY takes a different approach. It evaluates a learner’s current knowledge, identifies conceptual and prerequisite gaps, builds an interactive knowledge graph, and generates a dynamic **Study GPS route** toward the learner’s goal.

Instead of showing every possible topic, GUIDELY highlights the **single best next step**, explains why it matters, and updates the route as the learner progresses.

---

## 🎯 The Problem

Learners often struggle because:

- Online resources are scattered across different platforms.
- Generic roadmaps do not consider existing knowledge.
- Learners skip prerequisites and become stuck later.
- It is difficult to decide which topic should come next.
- Progress is usually tracked as a checklist instead of a connected learning path.

GUIDELY transforms learning from an unstructured search process into a guided navigation experience.

---

## 💡 Our Solution

GUIDELY creates a personalized learning route through five stages:

1. **Choose a learning destination**  
   The learner enters a career or skill goal.

2. **Add existing skills**  
   GUIDELY considers what the learner already believes they know.

3. **Complete a flash diagnostic**  
   A short assessment verifies knowledge and detects weak concepts.

4. **Generate the learning map**  
   Gemini analyzes the learner profile while Neo4j represents concepts and dependencies as a graph.

5. **Follow the Study GPS**  
   GUIDELY recommends the next concept, tracks completion, unlocks dependent topics, and recalculates the route.

---

## 🚀 Core Features

### 🧠 AI Skill-Gap Detection

GUIDELY combines claimed skills with diagnostic performance to identify:

- Verified strengths
- Weak concepts
- Missing prerequisites
- Current learning level
- Personalized reasoning behind the generated route

### 🕸️ Interactive Knowledge Graph

Concepts are displayed as connected learning nodes with meaningful states:

- `mastered`
- `active`
- `available`
- `missing`
- `locked`

The graph helps learners understand not only **what** to learn, but also **why one concept must come before another**.

### 🧭 Dynamic Study GPS

The Study GPS continuously determines:

- The next recommended concept
- Why it is the best next step
- Estimated learning time
- Remaining route duration
- Concepts unlocked after completion

When a learner completes a concept, GUIDELY recalculates the graph and updates the active route.

### 📊 Personalized Learning Workspace

The unified workspace includes:

- Study GPS route panel
- Interactive graph canvas
- Concept details inspector
- Skill-gap analysis
- Learning progress
- Saved learning routes
- Route restoration

### 📱 Responsive Experience

The interface is designed to remain usable across laptop and mobile screen sizes, including access to concept details and learning-route information.

### 🛡️ Reliable Demo Fallback

GUIDELY includes a deterministic local fallback engine. If Gemini or Neo4j is unavailable, the application can still generate a high-quality demo learning path and continue updating progress.

---

## 🔄 User Journey

```text
Landing Page
      ↓
Select Learning Goal
      ↓
Add Existing Skills
      ↓
Complete Flash Diagnostic
      ↓
AI Skill Analysis
      ↓
Personalized Knowledge Graph
      ↓
Study GPS Recommendation
      ↓
Complete Concept
      ↓
Unlock and Recalculate Route
```

---

## 🏗️ Architecture

```text
React + TypeScript Frontend
            │
            │ REST API
            ▼
Node.js + Express Server
       ┌────┴─────┐
       ▼          ▼
Google Gemini   Neo4j AuraDB
AI Analysis     Graph Persistence
       └────┬─────┘
            ▼
 Personalized Study GPS
```

GUIDELY uses a unified full-stack architecture. Express serves the API and production frontend, while Vite provides the development environment.

---

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Tailwind CSS 4
- Motion
- Lucide React
- Vite

### Backend

- Node.js
- Express
- TypeScript
- TSX
- Esbuild

### AI and Database

- Google Gemini API
- Google GenAI SDK
- Neo4j AuraDB
- Structured JSON response schemas
- Local deterministic fallback engine

### Deployment

- Render
- Render Blueprint
- Node.js 22

---

## 🔌 Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check server health |
| `POST` | `/api/assessment/questions` | Generate diagnostic questions |
| `POST` | `/api/assessment/evaluate` | Evaluate answers and create the learning route |
| `POST` | `/api/node/complete` | Mark a concept complete and recalculate progress |
| `GET` | `/api/route/:learnerId` | Restore a saved learning route |
| `POST` | `/api/routes/summaries` | Retrieve summaries of saved routes |

---

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/yash349a-ctrl/guidely-hackathon.git
cd guidely-hackathon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"

NEO4J_URI="neo4j+s://your-database-id.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="your-neo4j-password"
```

> Never commit your real API keys or database credentials.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📦 Production Build

```bash
npm run build
npm start
```

Other useful command:

```bash
npm run lint
```

---

## ☁️ Deploy on Render

The repository includes a `render.yaml` Blueprint.

1. Push the project to GitHub.
2. Open Render and create a new Blueprint.
3. Connect this repository.
4. Add the required environment variables.
5. Deploy the service.
6. Verify the deployment using `/api/health`.

The application can demonstrate its main workflow through fallback data even when external AI or database services are unavailable.

---

## 📁 Project Structure

```text
guidely-hackathon/
├── src/
│   ├── components/       # Reusable interface components
│   ├── context/          # Application state
│   ├── data/             # Questions and fallback learning tracks
│   ├── pages/            # Landing, onboarding, assessment and workspace
│   ├── server/           # Gemini integration
│   ├── services/         # Gemini, Neo4j and Study GPS services
│   ├── App.tsx
│   └── types.ts
├── server.ts             # Express server and API routes
├── render.yaml           # Render deployment configuration
├── package.json
└── README.md
```

---

## 🔮 Future Scope

- Adaptive learning-time estimation
- Knowledge-decay prediction and revision alerts
- AI-generated practice tasks and projects
- Voice-based AI interview simulations
- Collaborative learning routes
- Mentor and educator dashboards
- Portfolio generation from completed milestones
- Deeper analytics for strengths, gaps, and learning speed

---

## 🏆 Why GUIDELY Is Different

GUIDELY is not another course recommender or generic AI chatbot.

It combines:

- Diagnostic assessment
- AI-based skill analysis
- Graph-based prerequisite mapping
- Dynamic next-step recommendations
- Progress-aware route recalculation
- Persistent learning journeys

The result is a learning system that behaves like navigation software: it understands the destination, identifies the learner’s current position, and guides them through the best possible route.

---

<div align="center">

### Built for learners who do not need more content — they need the right direction.

**GUIDELY — Learn with direction. Progress with confidence.**

</div>


ew Simulator**: Spawns an interactive voice-based chat session when a landmark node is marked complete to verify understanding before unlocking downstream blocks.
