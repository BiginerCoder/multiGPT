require("dotenv").config();
const axios = require("axios");
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.GIMINI_API_KEY; 

module.exports.giminiapi = async (req, res) => {
    console.log("Entered in geminiapi controller line 7 at gimini.js");
    const { context, message, isTitle, user } = req.body;

    const chatTitlePrompt =
        "Generate only ONE short title (max 6 words). If the message is a greeting, return the same message.";

    const requestPayload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Context: ${context || message}
Prompt: ${isTitle ? chatTitlePrompt : message}`
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

        // Gemini actual text output
        const aiText =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        res.json({
            success: true,
            response: aiText
        });

    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Gemini API call failed",
            error: error.response?.data || error.message
        });
    }
};
// require("dotenv").config();
// const axios = require("axios");

// const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// const OPENROUTER_API_KEY = process.env.OPENROUTER_GOOGLE_GIMINI_FLASH;
// module.exports.giminiapi = async (req, res) => {
//     const { context, message, isTitle, user } = req.body;

//     const chatTitlePrompt =
//         "Generate only ONE short title (max 6 words). If the message is a greeting, return the same message.";

//     // Build content array
//     const content = [
//         {
//             type: "text",
//             text: `Context: ${context || message}\nPrompt: ${
//                 isTitle ? chatTitlePrompt : message
//             }`
//         }
//     ];

//     // 🖼️ IMAGE SUPPORT
//     if (user?.file?.data && user?.file?.mime_type) {
//         content.push({
//             type: "image_url",
//             image_url: {
//                 url: `data:${user.file.mime_type};base64,${user.file.data}`
//             }
//         });
//     }

//     try {
//         const response = await axios.post(
//             OPENROUTER_URL,
//             {
//                 model: "google/gemini-3-flash-preview",
//                 messages: [
//                     {
//                         role: "user",
//                         content: content
//                     }
//                 ]
//             },
//             {
//                 headers: {
//                     "Authorization": `Bearer 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`,
//                     "Content-Type": "application/json",
//                     "HTTP-Referer": "http://localhost:3000",
//                     "X-Title": "Personal Chat Bot"
//                 }
//             }
//         );

//         const aiText =
//             response.data?.choices?.[0]?.message?.content || "";

//         res.json({
//             success: true,
//             response: aiText
//         });

//     } catch (error) {
//         console.error("OpenRouter Error:", error.response?.data || error.message);
//         res.status(500).json({
//             success: false,
//             message: "OpenRouter API failed",
//             error: error.response?.data || error.message
//         });
//     }
// };
// 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

//AIzaSyDoJD-fq__XDCyh8icnUw36KT5SxSBOVv0

module.exports.giminiapiStream = async (req, res) => {
    try {
        const { context, message, user } = req.body;

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

        const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestPayload),
            }
        );

        if (!upstream.ok || !upstream.body) {
            const errText = await upstream.text();
            return res.status(500).json({ success: false, message: errText || "Gemini stream failed" });
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
                if (!payload || payload === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(payload);
                    const token = parsed?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
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
        console.error("Gemini stream error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
};
