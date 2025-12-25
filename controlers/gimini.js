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