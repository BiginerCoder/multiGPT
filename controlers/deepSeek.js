const apikey = require("../models/apiKeys");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-v3.2";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";

async function getDeepSeekProviderConfig(userId) {
  const saved = await apikey.findOne({ userId }).lean();
  const userKey = saved?.apiDeepSeekKey?.key?.trim();
  const userModel = saved?.apiDeepSeekKey?.model?.trim();

  if (userKey) {
    return {
      apiKey: userKey,
      model: userModel || DEFAULT_DEEPSEEK_MODEL,
      url: DEEPSEEK_URL,
      isRealProvider: true,
    };
  }

  return {
    apiKey: process.env.OPENROUTER_DEEPSEEK_API_KEY,
    model: DEFAULT_OPENROUTER_MODEL,
    url: OPENROUTER_URL,
    isRealProvider: false,
  };
}

function buildHeaders(config) {
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  if (!config.isRealProvider) {
    headers["HTTP-Referer"] = "http://localhost:3001";
    headers["X-Title"] = "MyChatApp";
  }

  return headers;
}

module.exports.deepseekapi = async (req, res) => {
  try {
    const { context, message, isTitle } = req.body;
    const userID = req.session?.userId;
    const providerConfig = await getDeepSeekProviderConfig(userID);

    if (!providerConfig.apiKey) {
      return res.status(500).json({
        success: false,
        error: "Missing DeepSeek/OpenRouter key",
      });
    }

    if (!message && !context) {
      return res.status(400).json({
        error: "Missing required fields: message or context",
      });
    }

    const titlePrompt =
      "Generate only ONE short title (max 6 words) for this conversation. " +
      "Do NOT ask questions. Do NOT add quotes. " +
      "If the message is a simple greeting, return the same greeting.";

    const finalUserMessage = isTitle ? titlePrompt : message;
    const systemContext = context ? `Context: ${context}` : `Context: ${message}`;

    const response = await fetch(providerConfig.url, {
      method: "POST",
      headers: buildHeaders(providerConfig),
      body: JSON.stringify({
        model: providerConfig.model,
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: finalUserMessage },
        ],
        max_tokens: isTitle ? 50 : 1000,
        temperature: isTitle ? 0.3 : 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek/OpenRouter Error:", data);
      return res.status(500).json({
        error: data?.error?.message || "DeepSeek request failed",
      });
    }

    const result = data?.choices?.[0]?.message?.content?.trim() || "No response";
    const cleanResult = isTitle ? result.replace(/["\n]/g, "").trim() : result;

    return res.status(200).json({
      success: true,
      result: cleanResult,
      isTitle,
    });
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports.deepseekapiStream = async (req, res) => {
  try {
    const { context, message } = req.body;
    const userID = req.session?.userId;
    const providerConfig = await getDeepSeekProviderConfig(userID);

    if (!providerConfig.apiKey) {
      return res.status(500).json({ error: "Missing DeepSeek/OpenRouter key" });
    }

    const upstream = await fetch(providerConfig.url, {
      method: "POST",
      headers: buildHeaders(providerConfig),
      body: JSON.stringify({
        model: providerConfig.model,
        messages: [
          {
            role: "system",
            content: context ? `Context: ${context}` : `Context: ${message}`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      }),
    });

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
