const apikey = require("../models/apiKeys");

module.exports.giminiTitle = async (req, res) => {
    console.log("Entered Gemini TITLE controller");

    const { message, context } = req.body;

    // ✅ Strict title instruction
    const chatTitlePrompt = `
Generate ONLY ONE short chat title (maximum 6 words).
Do NOT explain anything.
Do NOT add quotes.
Return plain text only.

Message:
${context || message}
`;

    const requestPayload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: chatTitlePrompt
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(
            `${API_URL}?key=${API_KEY}`,
            requestPayload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        // ✅ Extract title safely
        const title =
            response.data?.candidates?.[0]?.content?.parts
                ?.map(p => p.text || "")
                .join("")
                .trim() || "New Chat";

        res.json({
            success: true,
            title
        });

    } catch (error) {
        console.error(
            "Gemini Title Error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Title generation failed",
            error: error.response?.data || error.message
        });
    }
};
module.exports.giminiapiStream = async (req, res) => {
  try {
    const { context, message, user } = req.body;
    const userID = req.session?.userId;

    // ✅ IMPORTANT: await
    const saved_api_keys = await apikey.findOne({ userId: userID });

    console.log("Saved API Keys:", saved_api_keys);

    // ✅ Get active Gemini key or fallback
    const API_KEY =
      saved_api_keys?.apiGiminiKey?.find(k => k.isActive)?.key
      || process.env.GIMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing GIMINI_API_KEY"
      });
    }

    const requestPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Context: ${context || message}\nPrompt: ${message}`
            },
            ...(user?.file?.data
              ? [{
                  inline_data: {
                    mime_type: user.file.mime_type,
                    data: user.file.data
                  }
                }]
              : [])
          ]
        }
      ]
    };

    // ✅ Gemini streaming request
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!upstream.ok || !upstream.body) {
      const err = await upstream.text();
      return res.status(500).json({
        success: false,
        message: err || "Gemini stream failed"
      });
    }

    // ✅ SSE Headers
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
        const payload = evt
          .split(/\r?\n/)
          .filter(l => l.startsWith("data:"))
          .map(l => l.replace(/^data:\s*/, "").trim())
          .join("");

        if (!payload || payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload);

          const chunkText =
            parsed?.candidates?.[0]?.content?.parts
              ?.map(p => p.text || "")
              .join("") || "";

          if (chunkText) {
            res.write(`data: ${JSON.stringify({ token: chunkText })}\n\n`);
          }

        } catch {}
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("Gemini stream error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};
