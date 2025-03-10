const express = require("express")
const userchat = require("../models/userChat.js")
const { v4: uuidv4 } = require("uuid");

module.exports.api = async (req, res) => {
    try {
        const { userId, username, userMessage, aiResponse, title} = req.body;
        // Validate required fields
        if (!req.session.chatSessionId) {
            req.session.chatSessionId =  uuidv4();         // Generate a new session ID if not provided
        }
        let chatSessionId = req.session.chatSessionId;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const today = new Date().setHours(0, 0, 0, 0);

        // Find or create the chat document
        let dailyChat = await userchat.findOneAndUpdate(
            { chatSessionId, userId }, // Search criteria
            {
                $setOnInsert: { 
                    date: today, 
                    userId, 
                    username, 
                    chats: [], 
                    sessionStartTime: new Date(),
                    chatSessionId 
                }
            },
            { new: true, upsert: true }
        );

        if (!dailyChat) {
            return res.status(500).json({ success: false, message: "Failed to retrieve or create chat session" });
        }

        // Push new chat message
        aiResponse.forEach((response) => {
        dailyChat.chats.push({
            timestamp: new Date(),
            title: title,
            message: userMessage,
            response: response,
        });
    });
        dailyChat.lastActive = new Date();

        // Save the document
        await dailyChat.save();

        console.log("Chat saved with ID:", req.session.chatsessionId);

        res.status(200).json({
            success: true,
            message: "Chat saved successfully",
            chatId: req.session.chatSessionId // Send chatId back to the frontend
        });

    } catch (err) {
        console.error("Error saving chat:", err);
        res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

module.exports.chat = async (req, res) => {
    try {
        const userId = req.user._id; // Replace with actual user ID from session or passport
        const userChat = await userchat.find({ userId }).sort({ date: -1 });
        console.log(userchat)
        res.json(userChat);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving chat history.");
    }
}
