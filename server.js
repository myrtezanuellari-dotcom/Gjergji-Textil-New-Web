const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetchFn }) => fetchFn(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1";
const SYSTEM_PROMPT =
  process.env.OPENAI_SYSTEM_PROMPT ||
  "Ti je asistenti virtual i Gjergji H Textil. Pergjigju shkurt, qarte dhe me mirsjellje ne shqip, dhe sugjero kontaktimin per oferta kur eshte e pershtatshme.";

if (!OPENAI_API_KEY) {
  console.warn(
    "Missing OPENAI_API_KEY. Create a .env file from .env.example before starting the server."
  );
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

function buildInput(history, userMessage) {
  const items = [];
  items.push({
    type: "message",
    role: "system",
    content: [{ type: "input_text", text: SYSTEM_PROMPT }],
  });

  if (Array.isArray(history)) {
    history.slice(-10).forEach((item) => {
      if (!item || !item.role || !item.content) return;
      items.push({
        type: "message",
        role: item.role,
        content: [{ type: "input_text", text: String(item.content) }],
      });
    });
  }

  items.push({
    type: "message",
    role: "user",
    content: [{ type: "input_text", text: String(userMessage || "") }],
  });

  return items;
}

function extractAssistantText(payload) {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    if (item?.type !== "message" || item?.role !== "assistant") continue;
    const content = Array.isArray(item.content) ? item.content : [];
    const texts = content
      .filter((part) => part.type === "output_text" || part.type === "text")
      .map((part) => part.text)
      .filter(Boolean);
    if (texts.length) return texts.join("\n");
  }
  return "";
}

app.post("/api/chat", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Missing API key on server.",
    });
  }

  const message = String(req.body?.message || "").trim();
  const history = req.body?.history;

  if (!message) {
    return res.status(400).json({ error: "Missing message." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: buildInput(history, message),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error:", response.status, data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed.",
      });
    }

    const text = extractAssistantText(data);
    if (!text) {
      return res.status(502).json({
        error: "Empty response from model.",
      });
    }

    return res.json({ reply: text });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Server error while contacting OpenAI.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
