# DhwaniAI Copilot 🎙️
### Official Submission Project for **The Great Indian AI Internship Challenge (Gnani AI)**

An AI voice copilot built on **Gnani AI's Prisma v3.0 (STT)** and **Timbre v3.0 (TTS)** with real-time motion graphics audio visualizers, code-mixed Hinglish transcription, telephony 8kHz optimization, and dual-layer fallback architecture.

---

## 🌟 Key Features Built for the Award Categories
1. **Motion Graphics Audio Visualizer (3 Modes):**
   - **Neural Aurora Orb**: Dynamic fluid morphing sphere reactive to Web Audio API sound frequencies.
   - **Cyber Spectrum**: 360-degree radial audio EQ bars.
   - **Cinematic Wave**: Multi-layer oscillating sine ribbons.
2. **Gnani Models Integration:**
   - **Prisma v3.0 STT**: Automatic Indic language detection (`indic-auto`), phonetic code-mix handling for Hinglish.
   - **Timbre v3.0 TTS**: Expressive neural voice synthesis across multiple voices (`Nalini`, `Pranav`, `Karan`, `Priya`).
3. **100% Fail-Proof Fallback Architecture (For Seamless Demo Recording):**
   - If API keys are missing, network drops, or credits run out during screen recording:
     - Automatically switches to Web Speech API and intelligent local synthesis.
     - Zero crash screens or broken UI.
4. **1-Click High-Impact Demonstration Scenarios:**
   - **Kisan Mandi Rates**: Tier 2/3 AgTech agricultural assistant in Hinglish.
   - **Kirana Voice Khata**: Hands-free shopkeeper billing & udhaar ledger.
   - **PHC Clinic Triage**: 8kHz telephony noisy audio healthcare appointment assistant.

---

## 🚀 How to Run

1. Open project directory:
   ```bash
   cd /Users/saurabhkumarbajpaiai/.gemini/antigravity/scratch/gnani-ai-challenge
   ```
2. Start Frontend + Backend:
   ```bash
   npm run start
   ```
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🔑 Adding Your Gnani AI API Key
You can add your API key in **two easy ways**:

### Option A: Directly in the Web UI (Instant)
1. Open [http://localhost:5173](http://localhost:5173).
2. Click the **"Settings" / "Fallback Active"** button in the top right.
3. Paste your API key in the **Gnani AI API Key** input field and click **Save & Connect**.

### Option B: In the `.env` file
1. Edit `.env` in this directory:
   ```env
   GNANI_API_KEY=your_actual_key_here
   ```
2. The server will pick it up immediately.

---

## 📹 Video Recording Guide (60-Second Demo for LinkedIn / X)
1. Open [http://localhost:5173](http://localhost:5173) in full-screen (`F11` or Mac Green Button).
2. Click the **Glowing Mic Button** or click any of the **3 Instant Scenarios** (e.g. *Kisan Mandi Rates*).
3. Observe the fluid Motion Orb pulsing to the voice, live transcript appearing with code-mix badge, and Timbre voice responding in real time.
4. Post on LinkedIn or X with:
   ```text
   #GnaniAI #GreatIndianAIInternshipChallenge
   ```
   Tag **Team Gnani AI** for verification and popular engagement!
