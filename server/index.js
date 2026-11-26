import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  generateChatReply,
  getConfiguredModel,
  improveUserPrompt,
  isGeminiConfigured,
  mapGeminiError,
} from "./gemini.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: isGeminiConfigured(),
    model: getConfiguredModel(),
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, message } = req.body || {};

    const normalizedMessages = Array.isArray(messages)
      ? messages
      : typeof message === "string" && message.trim()
        ? [{ role: "user", text: message.trim() }]
        : [];

    if (normalizedMessages.length === 0) {
      return res.status(400).json({
        error: "Please enter a message before sending.",
      });
    }

    const result = await generateChatReply(normalizedMessages);
    return res.json(result);
  } catch (error) {
    const mapped = mapGeminiError(error);
    return res.status(mapped.status).json({ error: mapped.message });
  }
});

app.post("/api/improve", async (req, res) => {
  try {
    const { prompt, focus } = req.body || {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a prompt to improve.",
      });
    }

    const result = await improveUserPrompt(prompt, focus);
    return res.json(result);
  } catch (error) {
    const mapped = mapGeminiError(error);
    return res.status(mapped.status).json({ error: mapped.message });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

const distDir = path.join(rootDir, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    return res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  const statusLabel = isGeminiConfigured()
    ? `Gemini ready (${getConfiguredModel()})`
    : "GEMINI_API_KEY not set in .env";
  console.log(`PromptPal backend listening on http://localhost:${PORT} [${statusLabel}]`);
});
