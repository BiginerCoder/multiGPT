// const userchat = require("../models/userChat.js")
// const { v4: uuidv4 } = require("uuid");

// module.exports.api = async (req, res) => {
//     console.log("Entered savechat api");    
//     try {
//         const { userId, username, userMessage, aiResponse, title, currchatId} = req.body;

//         if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

//         const today = new Date().setHours(0, 0, 0, 0);

//        let chatSessionId;

//         if (currchatId) {
//             // history chat
//             chatSessionId = currchatId;
//         } else {
//             // new / ongoing chat
//             if (!req.session.chatSessionId) {
//                 req.session.chatSessionId = uuidv4();
//             }
//             chatSessionId = req.session.chatSessionId;
//         }

//         console.log("chatSessionId:", chatSessionId, "userId:", userId, "currchatId:", currchatId == chatSessionId? "on history Page": "on new/ongoing chat");
//         let dailyChat = await userchat.findOneAndUpdate(
//             { chatSessionId, userId }, // Search criteria
//             {
//                 $setOnInsert: { 
//                     date: today, 
//                     userId, 
//                     username, 
//                     chats: [], 
//                     sessionStartTime: new Date(),
//                     chatSessionId 
//                 }
//             },
//             { new: true, upsert: true }
//         );
//         console.log("Daily chat document:", dailyChat);
//         if (!dailyChat) {
//             return res.status(500).json({ success: false, message: "Failed to retrieve or create chat session" });
//         }

//         // Push new chat message
//         aiResponse.forEach((response) => {
//         dailyChat.chats.push({
//             timestamp: new Date(),
//             title: title,
//             message: userMessage,
//             response: response,
//         });
//     });
//         dailyChat.lastActive = new Date();

//         // Save the document
//         await dailyChat.save();

//         console.log("Chat saved with ID:", req.session.chatsessionId);

//         res.status(200).json({
//             success: true,
//             message: "Chat saved successfully",
//             chatId: req.session.chatSessionId // Send chatId back to the frontend
//         });

//     } catch (err) {
//         console.error("Error saving chat:", err);
//         res.status(500).json({ success: false, message: "Internal server error", error: err.message });
//     }
// };
const { v4: uuidv4 } = require("uuid");
const userchat = require("../models/userChat");

module.exports.api = async (req, res) => {
  console.log("Entered savechat api");

  try {
    const {
      userId,
      username,
      userMessage,
      aiResponse,
      title,
      currchatId,
    } = req.body;
    console.log("Request body, inside savachat line no 88 :", req.body);
    if (!userId || !userMessage || !aiResponse) {
      return res.status(200).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Correct Date object
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Determine chatSessionId
    let chatSessionId = currchatId;
    console.log("currchatId at line no 102 savechat api", currchatId);
    if (chatSessionId === null || chatSessionId === undefined) {
      if (!req.session.chatSessionId) {
        req.session.chatSessionId = uuidv4();
      }
        chatSessionId = req.session.chatSessionId;
    }

    console.log(
      "chatSessionId:",
      chatSessionId,
      "userId:",
      userId,
      currchatId === chatSessionId ? "history chat" : "new/ongoing chat"
    );

    // ✅ Find or create chat document
    let dailyChat = await userchat.findOneAndUpdate(
      { userId, chatSessionId },
      {
        $setOnInsert: {
          date: today,
          userId,
          username,
          chatSessionId,
          title: title || "New Chat",
          sessionStartTime: new Date(),
          chats: [],
        },
        $set: {
          lastActive: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    dailyChat.chats.push({
      timestamp: new Date(),
      title: title || "New Chat",
      message: userMessage,
      response: Array.isArray(aiResponse)
        ? aiResponse.join(" ")   // merge chunks
        : aiResponse,
    });


    await dailyChat.save();

    console.log("Chat saved with ID:", chatSessionId);

    return res.status(200).json({
      success: true,
      message: "Chat saved successfully",
      chatId: chatSessionId,
    });

  } catch (err) {
    console.error("Error saving chat:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports.chat = async (req, res) => {
    try {
        const userId = req.user._id; // Replace with actual user ID from session or passport
        const userChat = await userchat.find({ userId }).sort({ date: -1 }); // sort by newest first, limit to last 5 if needed
        console.log(userchat)
        res.json(userChat);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving chat history.");
    }
}
module.exports.endChat = async (req, res) => {
    if (req.session) {
        req.session.chatSessionId = null;
        res.status(200).json({ message: "Chat session ended" });
    } else {
        res.status(400).json({ message: "No active session" });
    }
}
