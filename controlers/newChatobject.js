const { v4: uuidv4 } = require("uuid");
const UserChat = require("../models/userChat");

module.exports.startNewChat = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const chatSessionId = uuidv4(); // Generate a unique session ID

    const newChat = new UserChat({
      chatSessionId,
      userId: req.session.userId,
      username: req.session.username,
      date: new Date(), // Store as Date object
      chats: [],
      sessionStartTime: new Date(), // Store actual Date object
      lastActive: new Date()
    });

    await newChat.save();

    // Store chat session ID in user session
    req.session.chatSessionId = chatSessionId;
    await req.session.save(); // Ensure session is saved properly

    res.status(201).json({
      success: true,
      message: "New chat session created!",
      chatSessionId
    });

  } catch (error) {
    console.error("Error creating new chat:", error);
    res.status(500).json({ success: false, message: "Failed to create chat" });
  }
};

// module.exports = { startNewChat };