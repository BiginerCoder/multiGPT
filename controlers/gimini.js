require("dotenv").config();
const axios = require("axios");
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.GIMINI_API_KEY; 

module.exports.giminiapi = async (req, res) => {
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
