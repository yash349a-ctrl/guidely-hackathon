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

### 1. Environment Variables
Configure `.env` at the root of the project:
```env
# Required for Gemini AI API calculations. Injected dynamically in AI Studio.
GEMINI_API_KEY="YOUR_REAL_GEMINI_API_KEY"

# The hosted URL of this applet
APP_URL="http://localhost:3000"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

### 4. Build & Start Production
```bash
npm run build
npm start
```

---

## 🧬 Future Scope & Innovation Roadmap
1. **Learning DNA**: A telemetry system tracking how fast a student completes practice tasks to dynamically adjust subsequent node estimated hours.
2. **Knowledge Decay Prediction**: Predicts when a student is about to forget previously mastered concepts based on retrieval intervals, placing warning indicators on completed graph nodes.
3. **AI Portfolio Builder**: Gathers completed concept project suggestions and automatically compiles them into a shareable web portfolio page.
4. **AI Interview Simulator**: Spawns an interactive voice-based chat session when a landmark node is marked complete to verify understanding before unlocking downstream blocks.
