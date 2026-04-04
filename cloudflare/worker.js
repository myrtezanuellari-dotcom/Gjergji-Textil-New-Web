function buildInput(systemPrompt, history, userMessage) {
  const items = [];
  items.push({
    type: "message",
    role: "system",
    content: [{ type: "input_text", text: systemPrompt }],
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

function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/chat") {
      return withCors(new Response("Not found", { status: 404 }));
    }

    if (request.method !== "POST") {
      return withCors(new Response("Method not allowed", { status: 405 }));
    }

    if (!env.OPENAI_API_KEY) {
      return withCors(
        new Response(JSON.stringify({ error: "Missing API key." }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return withCors(
        new Response(JSON.stringify({ error: "Invalid JSON." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    const message = String(payload?.message || "").trim();
    const history = payload?.history;
    if (!message) {
      return withCors(
        new Response(JSON.stringify({ error: "Missing message." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    const systemPrompt =
      env.OPENAI_SYSTEM_PROMPT ||
      "Ti je asistenti virtual i Gjergji H Textil. Pergjigju shkurt, qarte dhe me mirsjellje ne shqip, dhe sugjero kontaktimin per oferta kur eshte e pershtatshme.";
    const model = env.OPENAI_MODEL || "gpt-4.1";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: buildInput(systemPrompt, history, message),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return withCors(
        new Response(
          JSON.stringify({
            error: data?.error?.message || "OpenAI request failed.",
          }),
          { status: response.status, headers: { "Content-Type": "application/json" } }
        )
      );
    }

    const text = extractAssistantText(data);
    if (!text) {
      return withCors(
        new Response(JSON.stringify({ error: "Empty response from model." }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return withCors(
      new Response(JSON.stringify({ reply: text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  },
};
