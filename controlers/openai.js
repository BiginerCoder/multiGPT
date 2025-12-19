
require("dotenv").config();
const axios = require("axios");

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
                    "Authorization": `Bearer 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`,
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
