require("dotenv").config();
const axios = require("axios");
const apikey = require("../models/apiKeys");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-120b:free";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

async function getOpenAIProviderConfig(userId) {
  const saved = await apikey.findOne({ userId }).lean();
  const userKey = saved?.apiChatGPTKey?.key?.trim();
  const userModel = saved?.apiChatGPTKey?.model?.trim();

  if (userKey) {
    return {
      apiKey: userKey,
      model: userModel || DEFAULT_OPENAI_MODEL,
      url: OPENAI_URL,
      isRealProvider: true,
    };
  }

  return {
    apiKey: process.env.OPENAI_OPENROUTER_KEY,
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
    headers["HTTP-Referer"] = "http://localhost:3000";
    headers["X-Title"] = "Chat Request";
  }

  return headers;
}

async function generateTitle(response, providerConfig) {
  const titleResponse = await axios.post(
    providerConfig.url,
    {
      model: providerConfig.model,
      messages: [
        {
          role: "system",
          content: "Generate a short, meaningful title (max 5-6 words) for this response.",
        },
        { role: "user", content: response },
      ],
      temperature: 0.5,
    },
    {
      headers: buildHeaders(providerConfig),
    }
  );

  return titleResponse.data?.choices?.[0]?.message?.content || "New Chat";
}

module.exports.getCompletion = async (req, res) => {
  try {
    const { context, message, title, isTitle } = req.body;
    const userID = req.session?.userId;
    const providerConfig = await getOpenAIProviderConfig(userID);

    if (!providerConfig.apiKey) {
      return res.status(500).json({
        success: false,
        message: "Missing OpenAI/OpenRouter key",
      });
    }

    const shouldGenerateTitle = Boolean(title || isTitle);
    if (shouldGenerateTitle) {
      const generatedTitle = await generateTitle(message || context || "", providerConfig);
      return res.json({ response: generatedTitle, title: generatedTitle });
    }

    const prompt = `${context || ""}\nCurrent user prompt: ${message || ""}`;

    const completion = await axios.post(
      providerConfig.url,
      {
        model: providerConfig.model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: buildHeaders(providerConfig),
      }
    );

    const output = completion.data?.choices?.[0]?.message?.content || "";
    const responseData = { response: output };

    return res.json(responseData);
  } catch (error) {
    console.error("Error generating OpenAI completion:", error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports.getCompletionStream = async (req, res) => {
  try {
    const { context, message } = req.body;
    const userID = req.session?.userId;
    const providerConfig = await getOpenAIProviderConfig(userID);
    const prompt = `${context || ""}\nCurrent user prompt: ${message || ""}`;

    if (!providerConfig.apiKey) {
      return res.status(500).json({ error: "Missing OpenAI/OpenRouter key" });
    }

    const upstream = await fetch(providerConfig.url, {
      method: "POST",
      headers: buildHeaders(providerConfig),
      body: JSON.stringify({
        model: providerConfig.model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errTxt = await upstream.text();
      return res.status(500).json({ error: errTxt || "Streaming request failed" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";

      for (const evt of events) {
        const lines = evt.split(/\r?\n/).filter(Boolean);
        const dataLines = lines.filter((l) => l.startsWith("data:"));
        if (dataLines.length === 0) continue;

        const data = dataLines
          .map((l) => l.replace(/^data:\s*/, "").trim())
          .join("");

        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(data);
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
    console.error("OpenAI stream error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
