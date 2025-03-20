

require("dotenv").config();
const axios = require("axios");
const API_KEY = process.env.OPENAI_API_KEY;
const URL = "https://api.openai.com/v1/chat/completions"; // Define URL

module.exports.getCompletion = async (req, res) => {
    try {
        const { context, message, title } = req.body;
        const prompt = `${context}\nCurrent user prompt: ${message}`;

        const completion = await axios.post(URL, {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer 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`,
                "Content-Type": "application/json"
            }
        });

        let responseData = {
            response: completion.data.choices[0].message.content,
        };

        if (title) {
            responseData.title = await generateTitle(responseData.response);
        }

        res.json(responseData);
       
    } catch (error) {
        console.error("Error generating AI completion:", error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

// Helper function for title generation
async function generateTitle(response) {
    const titleResponse = await axios.post(URL, {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "Generate a short, meaningful title (max 10 words) for this response." },
            { role: "user", content: response },
        ],
        temperature: 0.5
    }, {
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    return titleResponse.data.choices[0].message.content;
}
