const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetchFn }) => fetchFn(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const AI_PROVIDER = (process.env.AI_PROVIDER || "lmstudio").toLowerCase();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const OLLAMA_TEMPERATURE = Number.parseFloat(
  process.env.OLLAMA_TEMPERATURE || "0.2"
);
const OLLAMA_TOP_P = Number.parseFloat(process.env.OLLAMA_TOP_P || "0.9");
const OLLAMA_NUM_PREDICT = Number.parseInt(
  process.env.OLLAMA_NUM_PREDICT || "400",
  10
);

const LMSTUDIO_BASE_URL = process.env.LMSTUDIO_BASE_URL || "http://localhost:1234/v1";
const LMSTUDIO_MODEL = process.env.LMSTUDIO_MODEL || "local-model";
const LMSTUDIO_TEMPERATURE = Number.parseFloat(
  process.env.LMSTUDIO_TEMPERATURE || "0.2"
);
const LMSTUDIO_TOP_P = Number.parseFloat(process.env.LMSTUDIO_TOP_P || "0.9");
const LMSTUDIO_MAX_TOKENS = Number.parseInt(
  process.env.LMSTUDIO_MAX_TOKENS || "400",
  10
);

const LOCALAI_BASE_URL = process.env.LOCALAI_BASE_URL || "http://localhost:8080/v1";
const LOCALAI_MODEL = process.env.LOCALAI_MODEL || "local-model";
const LOCALAI_TEMPERATURE = Number.parseFloat(
  process.env.LOCALAI_TEMPERATURE || "0.2"
);
const LOCALAI_TOP_P = Number.parseFloat(process.env.LOCALAI_TOP_P || "0.9");
const LOCALAI_MAX_TOKENS = Number.parseInt(
  process.env.LOCALAI_MAX_TOKENS || "400",
  10
);

const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama3-8b-8192";
const GROQ_TEMPERATURE = Number.parseFloat(
  process.env.GROQ_TEMPERATURE || "0.2"
);
const GROQ_TOP_P = Number.parseFloat(process.env.GROQ_TOP_P || "0.9");
const GROQ_MAX_TOKENS = Number.parseInt(
  process.env.GROQ_MAX_TOKENS || "400",
  10
);
const AGENT_PHONE = process.env.AGENT_PHONE || "+355697088800";
const LONG_MESSAGE_CHAR_LIMIT = Number.parseInt(
  process.env.LONG_MESSAGE_CHAR_LIMIT || "280",
  10
);
const LONG_MESSAGE_WORD_LIMIT = Number.parseInt(
  process.env.LONG_MESSAGE_WORD_LIMIT || "60",
  10
);
const SYSTEM_PROMPT =
  process.env.GROQ_SYSTEM_PROMPT ||
  process.env.LMSTUDIO_SYSTEM_PROMPT ||
  process.env.LOCALAI_SYSTEM_PROMPT ||
  process.env.OLLAMA_SYSTEM_PROMPT ||
  process.env.OPENAI_SYSTEM_PROMPT ||
  "Ti je asistenti virtual i Gjergji H Textil. Pergjigju shkurt, qarte dhe me mirsjellje ne shqip, dhe sugjero kontaktimin per oferta kur eshte e pershtatshme.";

if (AI_PROVIDER === "ollama" && !OLLAMA_BASE_URL) {
  console.warn("Missing OLLAMA_BASE_URL in .env.");
}
if (AI_PROVIDER === "lmstudio" && !LMSTUDIO_BASE_URL) {
  console.warn("Missing LMSTUDIO_BASE_URL in .env.");
}
if (AI_PROVIDER === "localai" && !LOCALAI_BASE_URL) {
  console.warn("Missing LOCALAI_BASE_URL in .env.");
}
if (AI_PROVIDER === "groq" && !GROQ_API_KEY) {
  console.warn("Missing GROQ_API_KEY in .env.");
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

function isTooLongMessage(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return false;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return (
    trimmed.length > LONG_MESSAGE_CHAR_LIMIT || wordCount > LONG_MESSAGE_WORD_LIMIT
  );
}

function contactReply() {
  return `Ju lutem na kontaktoni ne ${AGENT_PHONE}.`;
}

function buildOllamaMessages(history, userMessage) {
  const messages = [];
  messages.push({ role: "system", content: SYSTEM_PROMPT });

  if (Array.isArray(history)) {
    history.slice(-10).forEach((item) => {
      if (!item || !item.role || !item.content) return;
      const role = item.role === "assistant" ? "assistant" : "user";
      messages.push({ role, content: String(item.content) });
    });
  }

  messages.push({ role: "user", content: String(userMessage || "") });
  return messages;
}

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();
  const history = req.body?.history;

  if (!message) {
    return res.status(400).json({ error: "Missing message." });
  }

  if (isTooLongMessage(message)) {
    return res.json({ reply: contactReply() });
  }

  try {
    let response;
    if (AI_PROVIDER === "lmstudio") {
      response = await fetch(`${LMSTUDIO_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: LMSTUDIO_MODEL,
          messages: buildOllamaMessages(history, message),
          temperature: Number.isFinite(LMSTUDIO_TEMPERATURE)
            ? LMSTUDIO_TEMPERATURE
            : 0.2,
          top_p: Number.isFinite(LMSTUDIO_TOP_P) ? LMSTUDIO_TOP_P : 0.9,
          max_tokens: Number.isFinite(LMSTUDIO_MAX_TOKENS)
            ? LMSTUDIO_MAX_TOKENS
            : 400,
          stream: false,
        }),
      });
    } else if (AI_PROVIDER === "localai") {
      response = await fetch(`${LOCALAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: LOCALAI_MODEL,
          messages: buildOllamaMessages(history, message),
          temperature: Number.isFinite(LOCALAI_TEMPERATURE)
            ? LOCALAI_TEMPERATURE
            : 0.2,
          top_p: Number.isFinite(LOCALAI_TOP_P) ? LOCALAI_TOP_P : 0.9,
          max_tokens: Number.isFinite(LOCALAI_MAX_TOKENS)
            ? LOCALAI_MAX_TOKENS
            : 400,
          stream: false,
        }),
      });
    } else if (AI_PROVIDER === "groq") {
      response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: buildOllamaMessages(history, message),
          temperature: Number.isFinite(GROQ_TEMPERATURE)
            ? GROQ_TEMPERATURE
            : 0.2,
          top_p: Number.isFinite(GROQ_TOP_P) ? GROQ_TOP_P : 0.9,
          max_tokens: Number.isFinite(GROQ_MAX_TOKENS)
            ? GROQ_MAX_TOKENS
            : 400,
          stream: false,
        }),
      });
    } else {
      response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: buildOllamaMessages(history, message),
          options: {
            temperature: Number.isFinite(OLLAMA_TEMPERATURE)
              ? OLLAMA_TEMPERATURE
              : 0.2,
            top_p: Number.isFinite(OLLAMA_TOP_P) ? OLLAMA_TOP_P : 0.9,
            num_predict: Number.isFinite(OLLAMA_NUM_PREDICT)
              ? OLLAMA_NUM_PREDICT
              : 400,
          },
          stream: false,
        }),
      });
    }

    const data = await response.json();
    if (!response.ok) {
      console.error("AI error:", response.status, data);
      return res.status(response.status).json({
        error: data?.error || "AI request failed.",
      });
    }

    const text =
      AI_PROVIDER === "lmstudio" ||
      AI_PROVIDER === "localai" ||
      AI_PROVIDER === "groq"
        ? data?.choices?.[0]?.message?.content || ""
        : data?.message?.content || "";
    if (!text) {
      return res.status(502).json({
        error: "Empty response from model.",
      });
    }

    return res.json({ reply: text });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Server error while contacting AI provider.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


