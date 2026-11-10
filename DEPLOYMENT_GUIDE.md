# GramVani / DhwaniAI Copilot — Deployment Guide
**Great Indian AI Internship Challenge | Candidate: Saurabh Kumar Bajpai**

---

## ⚡ Local Dev (30 seconds)

```bash
# 1. Clone / navigate to project
cd gnani-ai-challenge

# 2. Install deps
npm install

# 3. Set your secrets
cp .env.example .env
# Edit .env and fill in keys (see section below)

# 4. Start both frontend + backend
npm run start
# → Backend:  http://localhost:3001
# → Frontend: http://localhost:5173
```

---

## 🔑 Required Environment Variables

| Variable | Purpose | Example / Source |
|---|---|---|
| `GNANI_API_KEY` | Gnani AI Vachana API Key | `vach_...` from app.gnani.ai |
| `GROQ_API_KEY` | Groq Cloud LLM | `gsk_...` from console.groq.com |
| `OPENROUTER_API_KEY` | OpenRouter fallback LLM | `sk-or-v1-...` from openrouter.ai |
| `LLM_PROVIDER` | `groq` or `openrouter` | `groq` |
| `LLM_MODEL` | Model ID to use | `qwen/qwen3.8-27b` |
| `PORT` | Backend port | `3001` |

> **Note:** Never commit your `.env` file. It is in `.gitignore`.

---

## ☁️ Deploy on Render (Recommended — Free Tier)

### Option A: Docker deploy (zero-config)

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set **Environment**: Docker
5. Add all env vars under **Environment → Add Environment Variable**
6. Click **Deploy** — Render auto-builds and runs the container

Port is auto-detected from `EXPOSE 3001` in Dockerfile.

### Option B: Node.js native deploy

1. **Build Command:** `npm install && npm run build`
2. **Start Command:** `node server.mjs`
3. Add all env vars in Render dashboard

---

## 🚂 Deploy on Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set env vars
railway variables set GNANI_API_KEY=vach_...
railway variables set GROQ_API_KEY=gsk_...
railway variables set LLM_PROVIDER=groq
railway variables set LLM_MODEL=qwen/qwen3.8-27b
```

---

## 🌐 Deploy on Netlify (CLI)

```bash
# 1. Link or create the site
netlify init   # or: netlify sites:create dhwaniai-copilot

# 2. Import env vars from .env (never committed to git)
netlify env:import .env

# 3. Build + deploy to production
netlify deploy --build --prod
```

Architecture on Netlify: the Vite static build is served from the CDN, and
`/api/*` requests are proxied (via `netlify.toml` redirect) to a serverless
function (`netlify/functions/api.mjs`) that wraps the same Express app from
`server.mjs` with `serverless-http`. The ffmpeg audio-transcode step is skipped
gracefully in the Lambda runtime and the browser's WebM upload is used directly.

---

## 🐳 Docker Build & Run Locally

```bash
# Build image
docker build -t gramvani-copilot .

# Run with env vars
docker run -p 3001:3001 \
  -e GNANI_API_KEY=vach_... \
  -e GROQ_API_KEY=gsk_... \
  -e LLM_PROVIDER=groq \
  -e LLM_MODEL=qwen/qwen3.8-27b \
  gramvani-copilot

# App available at: http://localhost:3001
```

---

## ⚙️ Architecture in Production

```
Browser → React Frontend (served from /dist by Express)
              ↓
         Express Backend (:3001)
         ├── POST /api/stt    → Gnani Prisma v3.0 (STT)
         ├── POST /api/tts    → Gnani Timbre v3.0 / Shivani 48kHz (TTS)
         ├── POST /api/chat   → Groq Cloud LLM (qwen/qwen3.8-27b)
         │       └── fallback → OpenRouter (openai/gpt-oss-120b)
         │       └── fallback → Domain keyword pipeline (offline)
         └── GET  /api/health → Docker / Render healthcheck
```

---

## 🔐 Security Features (OWASP Hardened)

| Defense | Implementation |
|---|---|
| Rate Limiting | 60 req/min/IP sliding window |
| MIME Validation | Rejects non-audio upload files |
| CORS Whitelist | Allows only dev + prod origin |
| HTTP Security Headers | `X-Frame-Options`, `X-XSS-Protection`, `nosniff` |
| Input Length Caps | TTS ≤ 1000 chars, Chat ≤ 500 chars |
| Credit Protection | Rate limiter prevents API credit drain |

---

## 📝 Submission Checklist

- [x] Gnani Prisma v3.0 STT integrated and working
- [x] Gnani Timbre v3.0 TTS (Shivani, 48kHz) integrated and working
- [x] Cloud Open-Source LLM (Groq Qwen3.8-27b) — real AI, no mocking
- [x] Fallback chain: Groq → OpenRouter → Keyword Pipeline
- [x] 3D Neural Motion Orb with real-time audio-frequency visualization
- [x] Live APMC Mandi price intelligence
- [x] Verified trader contact cards
- [x] Digital E-Gate pass issuance
- [x] Voice-driven conversational UX (ask-and-answer flow)
- [x] OWASP-hardened backend (pentest report attached)
- [x] Dockerfile for 1-click cloud deployment
- [x] 1080p demo video recorded
- [x] LinkedIn / X post ready

---

*Candidate: Saurabh Kumar Bajpai | #GnaniAI #GreatIndianAIInternshipChallenge*
