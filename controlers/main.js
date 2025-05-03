
const userchat = require("../models/userChat.js")
const User = require("../models/loginShema.js");
const { json } = require("express");
require('dotenv').config()

module.exports.home = async (req, res) => {
  console.log("Session Data:", req.user._id); // Logs all session data to the console
  req.session.userId = req.user._id;

  const user = await userchat.findOne({ userId: req.user._id });
  let userdata = null;

  if (!user) {
      const userchatdata = new userchat();
      userchatdata.userId = req.user._id;
      userchatdata.username = req.user.username;
      userdata = userchatdata;
  } else {
      userdata = user;
  }

  // Convert ObjectId to string for rendering in EJS
  const dataToRender = {
      userId: userdata.userId.toString(),
      username: userdata.username,
  };
  const dotenv = {
    apiKey: process.env.API_KEY,
    apiurl: process.env.API_URL,
  }
  console.log("User Chat Data:", dataToRender.userId);
  res.render("user/index.ejs", { userdata: dataToRender, dotenv: dotenv });
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
    res.render("user/chatHistory.ejs",  {historyData: serializedHistory, userdata: req.session.userId});
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.deleteChatHistory = async (req, res) => {
  try {
    const chatId = req.params.id;
    const history = await userchat.findOneAndDelete({ chatSessionId: chatId });

    // Optional: Send a success message if you want
    res.status(200).json({ success: true, message: "Chat history deleted successfully." });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


module.exports.login = (req, res) => {
    res.render("user/login.ejs" );
  }

module.exports.loginPost = (req, res) => {
   
  res.render("user/addApiKeys.ejs", { userdata: req.session.userId });  
  }

  
module.exports.signup = (req, res) =>{
    res.render("user/signup.ejs")
  }
module.exports.signupPost = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      await User.register(user, password); // Passport-local-mongoose handles hashing
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
  req.session.userId = req.user._id;

  const user = await userchat.findOne({ userId: req.user._id });
  let userdata = null;

  if (!user) {
      const userchatdata = new userchat();
      userchatdata.userId = req.user._id;
      userchatdata.username = req.user.username;
      userdata = userchatdata;
  } else {
      userdata = user;
  }

  // Convert ObjectId to string for rendering in EJS
  const dataToRender = {
      userId: userdata.userId.toString(),
      username: userdata.username,
  };
  const dotenv = {
    apiKey: process.env.API_KEY,
    apiurl: process.env.API_URL,
  }
  console.log("User Chat Data:", dataToRender.userId);
  res.render("user/index.ejs", { userdata: dataToRender, dotenv: dotenv });
};
