const userchat = require("../models/userChat.js");
const User = require("../models/loginShema.js");
const ApiKey = require("../models/apiKeys.js");
require("dotenv").config();

module.exports.home = async (req, res) => {
  console.log("Session Data:", req.user._id);
  req.session.userId = req.user._id;

  const user = await userchat.findOne({ userId: req.user._id }).lean();
  let userdata = user;

  if (!userdata) {
    userdata = {
      userId: req.user._id,
      username: req.user.username,
    };
  }

  req.session.userdata = userdata;

  const dataToRender = {
    userId: userdata.userId.toString(),
    username: userdata.username,
  };

  const dotenv = {
    apiKey: process.env.API_KEY,
    apiurl: process.env.API_URL,
  };

  console.log("User Chat Data:", dataToRender.userId);
  res.render("user/index.ejs", { userdata: dataToRender, dotenv });
};

module.exports.chatHistory = async (req, res) => {
  try {
    const chatId = req.params.id;
    const history = await userchat.findOne({ chatSessionId: chatId });

    if (!history) {
      console.error("No chat history found");
      return res.status(404).json({ error: "Chat history not found" });
    }

    const serializedHistory = JSON.parse(JSON.stringify(history));
    res.render("user/chatHistory.ejs", {
      historyData: serializedHistory,
      userdata: req.session.userdata,
      currchatId: chatId,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.deleteChatHistory = async (req, res) => {
  try {
    const chatId = req.params.id;
    await userchat.findOneAndDelete({ chatSessionId: chatId });
    res.status(200).json({ success: true, message: "Chat history deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports.login = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.loginPost = (req, res) => {
  res.redirect("/addapi");
};

module.exports.addApiPage = async (req, res) => {
  try {
    const apiDoc = await ApiKey.findOne({ userId: req.user._id }).lean();

    const apiConfig = {
      gemini: {
        model: apiDoc?.apiGiminiKey?.model || "gemini-2.5-flash",
        key: apiDoc?.apiGiminiKey?.key || "",
      },
      openai: {
        model: apiDoc?.apiChatGPTKey?.model || "gpt-4o-mini",
        key: apiDoc?.apiChatGPTKey?.key || "",
      },
      deepseek: {
        model: apiDoc?.apiDeepSeekKey?.model || "deepseek-chat",
        key: apiDoc?.apiDeepSeekKey?.key || "",
      },
    };

    res.render("user/addApiKeys.ejs", {
      userdata: req.user?._id || null,
      apiConfig,
    });
  } catch (err) {
    console.error("Error loading API settings:", err);
    res.status(500).send("Error loading API settings");
  }
};

module.exports.signup = (req, res) => {
  res.render("user/signup.ejs");
};

module.exports.signupPost = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    await User.register(user, password);
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error signing up. Try again.");
  }
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Error logging out.");
    }
    res.redirect("/");
  });
};

module.exports.addApiKey = async (req, res) => {
  try {
    const { models = {}, apikeys = {} } = req.body;
    const userId = req.user._id;

    await ApiKey.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          apiGiminiKey: {
            model: (models.gemini || "gemini-2.5-flash").trim(),
            key: (apikeys.gemini || "").trim(),
            createdAt: new Date(),
            isActive: true,
          },
          apiChatGPTKey: {
            model: (models.openai || "gpt-4o-mini").trim(),
            key: (apikeys.openai || "").trim(),
            createdAt: new Date(),
            isActive: true,
          },
          apiDeepSeekKey: {
            model: (models.deepseek || "deepseek-chat").trim(),
            key: (apikeys.deepseek || "").trim(),
            createdAt: new Date(),
            isActive: true,
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.redirect("/multiGPT");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving API keys");
  }
};
