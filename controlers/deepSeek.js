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

const ModelClient = require("@azure-rest/ai-inference").default;
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");

// Use environment variables for sensitive information
const token = process.env.DEEPSEEK_API_KEY;  // Store your token in an environment variable
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "DeepSeek-R1";

module.exports.deepseekapi = async (req, res) => {
  try {
    const { context, message, isTitle} = req.body;

    // Validate request body
    if (!context || !message) {
      return res.status(400).json({ error: "Missing required fields in request body" });
    }

    let chatTitle = "Generate only one title for this context without asking the user. If the message is a simple greeting, return the same message.";

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: `Context: ${context}` },
          { role: "user", content: isTitle ? chatTitle : message },
        ],
        max_tokens: 1000,
        model: modelName,
      },
    });

    if (isUnexpected(response)) {
      throw new Error(response.body.error);
    }

    const result = response.body.choices[0].message.content;

    // Send the response back to the client
    res.status(200).json({ result });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};