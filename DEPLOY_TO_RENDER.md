# Deploy GUIDELY to Render (same UI)

This package keeps the original UI source unchanged. Only the server port and deployment configuration were added for Render.

## 1. Push this folder to GitHub

Do not commit `.env`, `node_modules`, or `dist`.

```bash
git init
git add .
git commit -m "Prepare GUIDELY for Render"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 2. Create the Render service

1. Open Render Dashboard.
2. Select **New > Blueprint**.
3. Connect this GitHub repository.
4. Render detects `render.yaml`.
5. Select **Deploy Blueprint**.

The included Blueprint uses:

- Runtime: Node
- Region: Singapore
- Build: `npm ci && npm run build`
- Start: `npm start`
- Health check: `/api/health`
- Node: `22.16.0` from `.node-version`

## 3. Add secrets in Render

The app has deterministic fallback behavior, so it can demonstrate without external services. For live AI and database operations, open the Render service's **Environment** page and add:

- `GEMINI_API_KEY`
- `NEO4J_URI`
- `NEO4J_USERNAME`
- `NEO4J_PASSWORD`

Never place real secrets in `.env.example` or GitHub.

## 4. Test the live service

Open:

- `https://YOUR-SERVICE.onrender.com/`
- `https://YOUR-SERVICE.onrender.com/api/health`

Free Render web services can sleep after inactivity, so open the site shortly before judging.
