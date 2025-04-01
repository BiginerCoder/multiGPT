const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, 
  },
  apiGiminiKey: [
    {
        key: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
  ],
  apiChatGPTKey: [
    {
        key: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
  ],
  apiDeepSeekKey: [
    {
        key: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
  ],
  apiGrokKey: [
    {
        key: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
    },
  ]
 

});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);
module.exports = ApiKey;