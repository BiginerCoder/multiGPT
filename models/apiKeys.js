const mongoose = require("mongoose");

const providerCredentialSchema = new mongoose.Schema(
  {
    model: { type: String, default: "" },
    key: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const apiKeySchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, 
    unique: true,
  },
  apiGiminiKey: {
    type: providerCredentialSchema,
    default: () => ({ model: "gemini-2.5-flash", key: "" }),
  },
  apiChatGPTKey: {
    type: providerCredentialSchema,
    default: () => ({ model: "gpt-4o-mini", key: "" }),
  },
  apiDeepSeekKey: {
    type: providerCredentialSchema,
    default: () => ({ model: "deepseek-chat", key: "" }),
  },
  // apiGrokKey: [
  //   {
  //       key: { type: String },
  //       createdAt: { type: Date, default: Date.now },
  //       isActive: { type: Boolean, default: true },
  //   },
  // ]
 

});

const ApiKey = mongoose.model("ApiKey", apiKeySchema);
module.exports = ApiKey;
