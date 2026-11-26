import { GoogleGenAI, Type } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";
const PLACEHOLDER_KEYS = new Set(["", "your_gemini_api_key_here", "REPLACE_ME"]);

const CHAT_SYSTEM_INSTRUCTION = `You are PromptPal, a friendly, intelligent AI and Prompt Engineering assistant designed for college students, learners, and developers.

Your capabilities:
1. General Knowledge: Answer questions clearly, accurately, and in beginner-friendly language (e.g., "What is Artificial Intelligence?", science, history, study topics).
2. Programming & Technical Help: Explain coding concepts step by step, write clean code in fenced code blocks with language tags, and help debug errors.
3. Prompt Engineering: Teach prompt engineering principles (Role, Context, Task, Constraints, Output Format, Zero-Shot, Few-Shot, Chain-of-Thought), critique prompts, and provide actionable examples.

Style guidelines:
- Be concise yet thorough, well-structured, and easy to read.
- Use headings, bullet points, and examples where helpful.
- Never claim to be in "demo mode" — you are live and powered by Google Gemini.`;

const FOCUS_GUIDANCE = {
  general: "General-purpose clarity, structure, role, context, constraints, and output formatting.",
  coding: "Software engineering precision: specify language/framework, edge cases, code quality, comments, and step-by-step explanation.",
  education: "Learning and teaching clarity: specify target level, intuitive analogies, worked examples, and summary check questions.",
  writing: "Content writing polish: specify target audience, tone, structure, length, and engaging readability.",
  research: "Academic and analytical rigor: specify scope, structured synthesis, evidence criteria, and clear section headings.",
  productivity: "Action-oriented output: specify concrete steps, prioritization, timelines, and scannable checklists or tables.",
};

export function getConfiguredModel() {
  const model = (process.env.GEMINI_MODEL || "").trim();
  return model || DEFAULT_MODEL;
}

export function isGeminiConfigured() {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  return key.length > 0 && !PLACEHOLDER_KEYS.has(key);
}

function getClient() {
  if (!isGeminiConfigured()) {
    const err = new Error(
      "Gemini API key is not configured. Add your GEMINI_API_KEY to the .env file in the project root and restart the server."
    );
    err.status = 503;
    throw err;
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
}

export function mapGeminiError(error) {
  if (error?.status === 503 && error?.message?.includes("GEMINI_API_KEY")) {
    return { status: 503, message: error.message };
  }

  const rawMessage = String(error?.message || "");
  const lower = rawMessage.toLowerCase();
  const statusCode = Number(error?.status || error?.code || 0);

  if (
    lower.includes("api key not valid") ||
    lower.includes("api_key_invalid") ||
    lower.includes("invalid api key")
  ) {
    return {
      status: 401,
      message:
        "Your Gemini API key appears invalid. Double-check GEMINI_API_KEY in .env and restart the server.",
    };
  }

  if (statusCode === 401 || statusCode === 403 || lower.includes("permission")) {
    return {
      status: 401,
      message:
        "Gemini API authentication failed. Verify that your GEMINI_API_KEY is active and allowed to access the Gemini API.",
    };
  }

  if (statusCode === 404 || lower.includes("not found")) {
    return {
      status: 404,
      message: `The Gemini model "${getConfiguredModel()}" was not found. Update GEMINI_MODEL in .env (recommended: gemini-2.5-flash).`,
    };
  }

  if (
    statusCode === 429 ||
    lower.includes("resource_exhausted") ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {
    return {
      status: 429,
      message:
        "Gemini rate limit or quota reached. Please wait a moment and try again.",
    };
  }

  if (
    lower.includes("fetch failed") ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("network")
  ) {
    return {
      status: 503,
      message:
        "Unable to reach Google Gemini servers right now. Check your internet connection and try again.",
    };
  }

  if (statusCode === 400) {
    return {
      status: 400,
      message:
        "Gemini could not process this request. Try rephrasing your prompt and submitting again.",
    };
  }

  return {
    status: 500,
    message:
      rawMessage && rawMessage.length < 220
        ? `Gemini error: ${rawMessage}`
        : "Something went wrong while contacting Gemini. Please try again.",
  };
}

function buildConversationContents(messages) {
  const cleaned = messages
    .filter(
      (msg) =>
        msg &&
        !msg.isError &&
        typeof msg.text === "string" &&
        msg.text.trim().length > 0 &&
        (msg.role === "user" || msg.role === "bot" || msg.role === "model")
    )
    .slice(-20)
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text.trim() }],
    }));

  // Gemini multi-turn conversations should begin with a user turn.
  const firstUserIndex = cleaned.findIndex((item) => item.role === "user");
  if (firstUserIndex === -1) {
    return [];
  }
  return cleaned.slice(firstUserIndex);
}

export async function generateChatReply(messages) {
  const ai = getClient();
  const model = getConfiguredModel();
  const contents = buildConversationContents(messages);

  if (contents.length === 0) {
    const err = new Error("Please enter a non-empty message.");
    err.status = 400;
    throw err;
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  const reply = response?.text?.trim();
  if (!reply) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }

  return { reply, model };
}

export async function improveUserPrompt(originalPrompt, focus = "general") {
  const ai = getClient();
  const model = getConfiguredModel();
  const trimmed = String(originalPrompt || "").trim();

  if (!trimmed) {
    const err = new Error("Please enter a prompt to improve.");
    err.status = 400;
    throw err;
  }

  const focusKey = Object.hasOwn(FOCUS_GUIDANCE, focus) ? focus : "general";
  const focusHint = FOCUS_GUIDANCE[focusKey];

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Optimization Focus: ${focusKey} (${focusHint})

Original Prompt:
"""
${trimmed}
"""

Analyze the original prompt and rewrite it into a significantly clearer, more detailed, well-structured, ready-to-use prompt.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: `You are an expert Prompt Engineer.
Rewrite the user's ordinary prompt into a highly effective, ready-to-use prompt that preserves the user's true intent.
Include clear sections or elements where appropriate: Role/Persona, Context, Specific Task, Constraints/Quality Rules, and Desired Output Format.
Only add short bracketed placeholders like [target audience] if crucial details are missing.
Return JSON with:
- "improvedPrompt": the complete rewritten prompt text ready to copy and paste directly into an AI assistant.
- "improvements": an array of 3 to 4 concise bullet strings explaining specifically what you improved.`,
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvedPrompt: { type: Type.STRING },
          improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["improvedPrompt", "improvements"],
      },
    },
  });

  const rawText = response?.text?.trim();
  if (!rawText) {
    throw new Error("Gemini returned an empty response while improving the prompt.");
  }

  let parsed;
  try {
    const stripped = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    parsed = JSON.parse(stripped);
  } catch {
    return {
      improvedPrompt: rawText,
      improvements: [
        "Structured the prompt with clearer role, task, and formatting guidance.",
      ],
      model,
    };
  }

  const improvedPrompt = String(parsed?.improvedPrompt || "").trim();
  if (!improvedPrompt) {
    throw new Error("Gemini did not return an improved prompt. Please try again.");
  }

  const improvements = Array.isArray(parsed?.improvements)
    ? parsed.improvements
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return { improvedPrompt, improvements, model };
}
