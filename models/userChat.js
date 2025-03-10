const mongoose = require("mongoose");
const User = require("../models/loginShema")

const userDailyChatSchema = new mongoose.Schema({
  chatSessionId: {
    type: String, // Unique session ID for each chat
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    index: true, // Indexing for fast queries by date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Indexing for fast queries by user
  },
  username: String, // Optional, for convenience
  chats: [
    {
      timestamp: { type: Date, default: Date.now },
      title: String,
      message: String,
      response: String,
    }
  ],
  sessionStartTime: { type: Date, default: Date.now }, // Store session start time
  sessionEndTime: { type: Date }, // Store session end time
  lastActive: { type: Date, default: Date.now }
});

const UserDailyChat = mongoose.model("UserDailyChat", userDailyChatSchema);
module.exports = UserDailyChat;
