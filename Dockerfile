# =========================================================
# GramVani / DhwaniAI Copilot — Production Dockerfile
# Great Indian AI Internship Challenge | Gnani AI
# Candidate: Saurabh Kumar Bajpai
# =========================================================

# ---- Stage 1: Build React frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY index.html tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src
RUN npm run build

# ---- Stage 2: Production server ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production runtime deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built frontend and backend
COPY --from=frontend-builder /app/dist ./dist
COPY server.mjs ./

# .env.example for documentation — runtime secrets come from environment
COPY .env.example ./

# Expose backend port (Render/Railway/Cloud Run all honour PORT)
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "server.mjs"]
