# DhwaniAI Copilot — Solution Pitch (1 Page)

**Submission for The Great Indian AI Internship Challenge (Gnani AI)** — Saurabh Kumar Bajpai, Amity University

## The Problem
For Tier-2/3 Bharat — farmers, kirana store owners, and clinic patients — interacting with digital services is difficult: apps require typing English text, and existing voice bots don't handle **code-mixed Hinglish**, noisy **8kHz telephony audio**, or real-world speech patterns. Voice is the natural interface for the next 500M+ internet users, but it must actually work in their conditions.

## The Solution
**DhwaniAI Copilot** is a real-time AI voice assistant built natively on **Gnani AI's Prisma v3.0 (STT)** and **Timbre v3.0 (TTS)** — a single screen where a user speaks Hinglish and gets live transcription plus an expressive neural voice reply, with cinematic motion-graphics visualizers driven by the audio itself.

## Key Innovations
1. **Native Gnani Integration:** Prisma v3.0 `indic-auto` detects Indic languages automatically and handles phonetic code-mixing (e.g., *"aabla marketplace mein gehun ka bhav batao"*); Timbre v3.0 synthesizes expressive responses across multiple voices (Nalini, Pranav, Karan, Priya).
2. **Motion-Graphics Audio Visualizers (3 modes):** Neural Aurora Orb (fluid morphing sphere), Cyber Spectrum (360° radial EQ), Cinematic Wave (oscillating ribbons) — all reactive to Web Audio API frequencies.
3. **100% Fail-Proof Fallback Architecture:** if API keys, network, or credits fail mid-demo, it transparently switches to Web Speech API + local synthesis — **zero crash screens**, guaranteeing a seamless demo recording.
4. **Real-World Demo Scenarios (1-click):**
   - 🌾 **Kisan Mandi Rates** — AgTech assistant for mandi prices in Hinglish
   - 🧾 **Kirana Voice Khata** — hands-free shopkeeper billing & udhaar ledger
   - 🏥 **PHC Clinic Triage** — 8kHz telephony-optimized appointment assistant

## Tech Stack
React + TypeScript + Vite, Tailwind CSS, Web Audio API, Node.js proxy backend (server.mjs) securing the Gnani API key, Dockerized deployment.

## Impact & Fit for Gnani AI
DhwaniAI is a drop-in voice interface layer for enterprises serving non-English, first-internet-generation users — exactly Prisma/Timbre's strength. The fallback architecture makes voice UX resilient to flaky rural networks, and the three scenarios map directly to Gnani's target verticals (AgTech, retail, healthcare/telephony).

---

**Demo video:** https://youtu.be/zex-UxGgWbo
**Live app:** https://playful-dasik-a65ad5.netlify.app
**Run locally:** `npm run start` → http://localhost:5173 (add Gnani API key in Settings)
**Deploy:** `npm run build` + `netlify deploy --build --prod` (backend runs as a Netlify Function via serverless-http)
