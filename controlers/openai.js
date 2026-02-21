
require("dotenv").config();
const axios = require("axios");
const API_KEY = process.env.OPENAI_OPENROUTER_KEY;  // Use .env for security
// OpenRouter endpoint
const URL = "https://openrouter.ai/api/v1/chat/completions";

module.exports.getCompletion = async (req, res) => {
    console.log("ENTERD IN OPENAI CONTROLLER");
    try {
        
        const { context, message, title } = req.body;
        const prompt = `${context}\nCurrent user prompt: ${message}`;

        const completion = await axios.post(
            URL,
            {
                model: "openai/gpt-4o-mini",  // OpenRouter model name
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,  // Store your API key in .env
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",   // required
                    "X-Title": "Chat Request"                  // optional but recommended
                }
            }
        );

        let responseData = {
            response: completion.data.choices[0].message.content,
        };

        if (title) {
            responseData.title = await generateTitle(responseData.response);
        }

        res.json(responseData);

    } catch (error) {
        console.error(
            "Error generating AI completion:",
            error.response?.data || error.message
        );
        res.status(500).json({ error: error.message });
    }
};

module.exports.getCompletionStream = async (req, res) => {
    try {
        const { context, message } = req.body;
        const prompt = `${context || ""}\nCurrent user prompt: ${message || ""}`;

        const upstream = await fetch(URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Chat Request"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
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
                const data = line.replace(/^data:\s*/, "").trim();

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


// ---------------------------
//  Title Generator Function
// ---------------------------
async function generateTitle(response) {
    const titleResponse = await axios.post(
        URL,
        {
            model: "openai/gpt-5.1-codex",
            messages: [
                { role: "system", content: "Generate a short, meaningful title (max 5-6 words) for this response." },
                { role: "user", content: response },
            ],
            temperature: 0.5
        },
        {
            headers: {
                "Authorization": `Bearer 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`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Title Generator"
            }
        }
    );

    return titleResponse.data.choices[0].message.content;
}
