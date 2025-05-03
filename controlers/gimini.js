require("dotenv").config();
const axios = require("axios");
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const API_KEY = process.env.GIMINI_API_KEY; 

module.exports.giminiapi = async (req, res) => {
    const { context, message, isTitle, user } = req.body;
    let chatTitle = "You must generate only one title for this context without asking the user. If the message is a simple greeting, return the same message.";
    const requestPayload = {
        contents: [
            {
                parts: [
                    { text: `Context: ${context? context: message}\nPrompt: ${isTitle ? chatTitle : message}` },
                    ...(user?.file?.data ? [{ inline_data: user.file }] : [])
                ],
            },
        ],
    };

    try {
        const response = await axios.post(`${API_URL}?key=${API_KEY}`, requestPayload, {
            headers: { 'Content-Type': 'application/json' }  // ✅ Headers passed separately
        });

        //console.log("API Response:", response.data);
        res.json({ success: true, response: response.data }); // ✅ Send only `response.data`
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "API call failed", error: error.response?.data || error.message });
    }
};