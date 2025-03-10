require("dotenv").config();
const openai = require("openai");

module.exports.getCompletion = async (req, res) => {
    try {
        const { context, message, title } = req.body;
        const prompt = `${context}\nCurrent user prompt: ${message}`;
        if(!title){
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });

        let responseData = {
            response: completion.choices[0].message.content,
        };
        
        }

        if (title) {
            responseData.title = await generateTitle(responseData.response);
        }
        res.json(responseData);
       
    } catch (error) {
        console.error("Error generating AI completion:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper function for title generation
async function generateTitle(response) {
    const titleResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "Generate a short, meaningful title (max 10 words) for this response." },
            { role: "user", content: response },
        ],
    });
    return titleResponse.choices[0].message.content;
}
