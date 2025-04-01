require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const main = require("./controlers/main");
const savechat = require("./controlers/savechat.js");
const User = require("./models/loginShema");
const UserDailyChat = require("./models/userChat.js");
const newChat = require("./controlers/newChatobject.js"); 

const openai = require("./controlers/openai.js");
const Gemini = require("./controlers/gimini.js");
const deepseek = require("./controlers/deepSeek.js");

// MongoDB Connection
const mongo_url = 'mongodb+srv://newrahulurmaliya2004:JKMbOceeHVNdR9Ar@cluster0.0lirw.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(mongo_url)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Database connection error:", err));

// Session Store
const store = new MongoStore({
  mongoUrl: mongo_url,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});
// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Express Session
app.use(
  session({
    store,
    secret: process.env.SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6 * 24 * 60 * 60 * 1000, httpOnly: true },
  })
);

// Flash Messages
app.use(flash());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Middleware
app.use((req, res, next) => {
  if (!req.session.chatSessionId) {
    req.session.chatSessionId = require("uuid").v4();
  }
  res.locals.sessionId = req.session.chatSessionId;
  res.locals.user = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


// Middleware to Check If User Is Logged In
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
};

  
// Routes
app.get("/", requireAuth, main.home);
app.get("/test", async(req, res) => res.render("chatHistory.ejs"));
app.get("/login", main.login);
app.post(
  "/login",
  passport.authenticate("local", {
    // successRedirect: "/",
    // failureRedirect: "/login",
    successFlash: "Welcome back!",
    failureFlash: "Invalid username or password.",
  }),
  main.loginPost
);
app.get("/signup", main.signup);
app.post("/signup", main.signupPost);
app.get("/logout", main.logout);

app.get("/chat-history/:id", main.chatHistory);
app.delete("/chat-history/delete/:id", main.deleteChatHistory);

app.post("/api/openai", openai.getCompletion);
app.post("/api/gimini", Gemini.giminiapi);
app.post("/api/deepseek", deepseek.deepseekapi);
app.post("/addapikey", main.addApiKey);

app.get("/api/chat", requireAuth, savechat.chat);
app.post("/api/req", savechat.api);
app.get("/api/newchat", newChat.startNewChat);
app.post("/api/end-session", savechat.endChat);
app.get("/cookies", (req, res) => {
  res.cookie("name", "express").send(req.session);
}
);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// require("dotenv").config();
// const express = require("express");
// const app = express();
// const path = require("path");
// const session = require("express-session");
// const flash = require("connect-flash");
// const mongoose = require("mongoose");
// const MongoStore = require("connect-mongo");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const main = require("./controlers/main")
// const savechat = require("./controlers/savechat.js");
// const openai = require("./controlers/openai.js");
// const User = require("./models/loginShema");
// const UserDailyChat = require("./models/userChat.js");
// const newChat = require("./controlers/newChatobject.js"); 

// // MongoDB Connection
// const mongo_url = 'mongodb+srv://newrahulurmaliya2004:JKMbOceeHVNdR9Ar@cluster0.0lirw.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0';
// mongoose
//   .connect(mongo_url)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.log("Database connection error:", err));

// // Session Store
// const store = new MongoStore({
//   mongoUrl: mongo_url,
//   crypto: { secret: process.env.SECRET },
//   touchAfter: 24 * 3600,
// });

// // Express Session
// app.use(
//   session({
//     store,
//     secret: process.env.SECRET || "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 6 * 24 * 60 * 60 * 1000, httpOnly: true },
//   })
// );

// // Flash Messages
// app.use(flash());

// // Body Parser Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static Files
// app.use(express.static(path.join(__dirname, "/public")));

// // View Engine
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // Passport Configuration
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// // Global Middleware
// app.use((req, res, next) => {
//   if (!req.session.chatSessionId) {
//     req.session.chatSessionId = require("uuid").v4(); // Generate new session ID if not set
//   }
  
//   res.locals.sessionId = req.session.chatSessionId; // Make it available in views/templates
//   res.locals.user = req.user || null;
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   next();
// });

// // Middleware to Check If User Is Logged In
// const requireAuth = (req, res, next) => {
//   if (!req.isAuthenticated || !req.isAuthenticated()) {
//     return res.redirect("/login");
//   }
//   next();
// };

// // Routes
// app.get("/", requireAuth, main.home);
// app.get("/test", async(req, res) => 
// {
//   res.render("chatHistory.ejs");
// })
// app.get("/login", main.login);
// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//     successFlash: "Welcome back!",
//     failureFlash: "Invalid username or password.",
//   }),
//   main.loginPost
// );
// app.get("/signup", main.signup);
// app.post("/signup", main.signupPost);
// app.get("/logout", main.logout);

// app.get("/chat-history", async (req, res) => {
//   try {
//     const chats = await UserDailyChat.find({ userId: req.user._id }).sort({ date: -1 });
//     // res.json(chats);
//     console.log("chath history success");
//     res.send(chats);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error retrieving chat history.");
//   }
// });
// app.post("/api/openai", openai.getCompletion);

// app.get("/api/chat", requireAuth, savechat.chat);

// app.post("/api/req", savechat.api);

// //app.get("previuschat", main.previuschat);

// app.get("/print-session", (req, res) => {
//   console.log("Session Data:", req.session);
//   res.send(`Session Data: ${JSON.stringify(req.session)}`);
// });
// app.get("/api/newchat", newChat.startNewChat);
// //app.post("/api/end-session", destroySession.destroySession);

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
