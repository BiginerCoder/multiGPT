const apikey = require("../models/apiKeys");

module.exports.deepseekapi = async (req, res) => {
  console.log("Entered in deepseekapi (OpenRouter)");

  try {
    const { context, message, isTitle } = req.body;
    const userID = req.session?.userId;
    // save api in cache for one session and use it for all subsequent requests without fetching from DB every time
    const saved_api_keys = await apikey.findOne({ userId: userID });
    // selecting latest active api from last elemtent of array
    const API_KEY =
      saved_api_keys?.apiDeepSeekKey?.slice().reverse().find(k => k.isActive)?.key
      || process.env.OPENROUTER_DEEPSEEK_API_KEY;

    // Validation
    if (!message && !context) {
      return res.status(400).json({
        error: "Missing required fields: message or context",
      });
    }

    // 🔹 Title generation instruction (same as your old code)
    const titlePrompt =
      "Generate only ONE short title (max 6 words) for this conversation. " +
      "Do NOT ask questions. Do NOT add quotes. " +
      "If the message is a simple greeting, return the same greeting.";

    // 🔹 Decide final user prompt
    const finalUserMessage = isTitle ? titlePrompt : message;

    // 🔹 Decide system context
    const systemContext = context
      ? `Context: ${context}`
      : `Context: ${message}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`, // 🔐 move key to .env
          "HTTP-Referer": "http://localhost:3001", // change in prod
          "X-Title": "MyChatApp",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1",
          messages: [
            {
              role: "system",
              content: systemContext,
            },
            {
              role: "user",
              content: finalUserMessage,
            },
          ],
          max_tokens: isTitle ? 50 : 1000, // 🔥 small tokens for title
          temperature: isTitle ? 0.3 : 0.7, // 🔥 more deterministic titles
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(500).json({
        error: data?.error?.message || "OpenRouter API failed",
      });
    }

    const result =
      data?.choices?.[0]?.message?.content?.trim() || "No response";

    // 🔹 Clean title output (extra safety)
    const cleanResult = isTitle
      ? result.replace(/["\n]/g, "").trim()
      : result;
    console.log("DeepSeek OpenRouter Result:", cleanResult);
    return res.status(200).json({
      success: true,
      result: cleanResult,
      isTitle,
    });

  } catch (error) {
    console.error("DeepSeek OpenRouter Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};



module.exports.deepseekapiStream = async (req, res) => {
  try {
    const { context, message } = req.body;

    const upstream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_DEEPSEEK_API_KEY}`,
          "HTTP-Referer": "http://localhost:3001",
          "X-Title": "MyChatApp",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1",
          messages: [
            {
              role: "system",
              content: context ? `Context: ${context}` : `Context: ${message}`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      return res.status(500).json({ error: errText || "DeepSeek stream failed" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const evt of events) {
        const line = evt.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.replace(/^data:\s*/, "").trim();

        if (payload === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          const token = parsed?.choices?.[0]?.delta?.content || "";
          if (token) {
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
            await new Promise((r) => setTimeout(r, 10));
          }
        } catch (_) {
          // ignore malformed chunk
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("DeepSeek stream error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
