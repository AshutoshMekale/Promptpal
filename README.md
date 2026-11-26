# PromptPal — AI Prompt Engineering Assistant

PromptPal is a React + Vite frontend paired with a Node.js + Express backend connected to Google's **Gemini AI** (`@google/genai`).

## Features
- **AI Chat**: Ask general knowledge questions (e.g. *"What is Artificial Intelligence?"*), programming questions, and prompt engineering questions with multi-turn context, loading animation, `Enter` / `Shift + Enter` support, and clear error messages.
- **Prompt Improver**: Rewrite basic prompts into structured, detailed prompts with optimization focus modes and one-click **Copy Prompt**.
- **Learn Prompt Engineering**: Beginner-friendly guide covering the 5 prompt elements, weak vs. strong comparisons, 6 practical techniques, and common mistakes.
- **Prompt Templates**: Curated templates across Coding, Education, Content Writing, Research, and Productivity with category filters and one-click copy.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/apikey)) to `.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   PORT=3001
   ```
3. Run both frontend and backend in development:
   ```bash
   npm run dev
   ```
   - Frontend (Vite): `http://localhost:5173` (proxies `/api` requests to `http://localhost:3001`)
   - Backend (Express): `http://localhost:3001`

## Production Build
```bash
npm run build
npm start
```
