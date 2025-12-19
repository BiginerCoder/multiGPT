// require("dotenv").config();
// const axios = require("axios");
// const API_URL = "https://api.deepseek.ai/v1/generate";  // Assuming this is the DeepSeek API URL
// const API_KEY = process.env.DEEPSEEK_API_KEY;  // Use .env for security

// module.exports.deepseekapi = async (req, res) => {
//     const { context, message, isTitle, user } = req.body;
//     let chatTitle = "Generate only one title for this context without asking the user. If the message is a simple greeting, return the same message.";

//     const requestPayload = {
//         contents: [
//             {
//                 parts: [
//                     { text: `Context: ${context}\nPrompt: ${isTitle ? chatTitle : message}` },
//                     ...(user?.file?.data ? [{ inline_data: user.file }] : []),
//                 ],
//             },
//         ],
//     };

//     try {
//         const response = await axios.post(`${API_URL}?api_key=${API_KEY}`, requestPayload, {
//             headers: { 'Content-Type': 'application/json' }
//         });

//         res.json({ success: true, response: response.data });
//     } catch (error) {
//         console.error("API Error:", error.response?.data || error.message);
//         res.status(500).json({ success: false, message: "API call failed", error: error.response?.data || error.message });
//     }
// };

// const ModelClient = require("@azure-rest/ai-inference").default;
// const { isUnexpected } = require("@azure-rest/ai-inference");
// const { AzureKeyCredential } = require("@azure/core-auth");


module.exports.deepseekapi = async (req, res) => {
  console.log("Entered in deepseekapi (OpenRouter)");

  try {
    const { context, message, isTitle } = req.body;

    // Validation
    if (!message && !context) {
      return res.status(400).json({
        error: "Missing required fields: message or context",
      });
    }

    // 🔹 Title generation instruction (same as your old code)
    const titlePrompt =
      "Generate only ONE short title (max 6 words) for this conversation. " +
      "Do NOT ask questions. Do NOT add quotes. " +
      "If the message is a simple greeting, return the same greeting.";

    // 🔹 Decide final user prompt
    const finalUserMessage = isTitle ? titlePrompt : message;

    // 🔹 Decide system context
    const systemContext = context
      ? `Context: ${context}`
      : `Context: ${message}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_DEEPSEEK_API_KEY}`, // 🔐 move key to .env
          "HTTP-Referer": "http://localhost:3001", // change in prod
          "X-Title": "MyChatApp",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1",
          messages: [
            {
              role: "system",
              content: systemContext,
            },
            {
              role: "user",
              content: finalUserMessage,
            },
          ],
          max_tokens: isTitle ? 50 : 1000, // 🔥 small tokens for title
          temperature: isTitle ? 0.3 : 0.7, // 🔥 more deterministic titles
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(500).json({
        error: data?.error?.message || "OpenRouter API failed",
      });
    }

    const result =
      data?.choices?.[0]?.message?.content?.trim() || "No response";

    // 🔹 Clean title output (extra safety)
    const cleanResult = isTitle
      ? result.replace(/["\n]/g, "").trim()
      : result;
    console.log("DeepSeek OpenRouter Result:", cleanResult);
    return res.status(200).json({
      success: true,
      result: cleanResult,
      isTitle,
    });

  } catch (error) {
    console.error("DeepSeek OpenRouter Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

