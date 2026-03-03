require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate"); 
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const main = require("./controlers/main");
const savechat = require("./controlers/savechat.js");
const User = require("./models/loginShema");
const UserDailyChat = require("./models/userChat.js");
const newChat = require("./controlers/newChatobject.js"); 
const cron = require("node-cron");
const cors = require("cors");

const openai = require("./controlers/openai.js");
const Gemini = require("./controlers/gimini.js");
const deepseek = require("./controlers/deepSeek.js");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  },
});

app.locals.io = io;

io.on("connection", (socket) => {
  const { sessionId } = socket.handshake.query || {};
  if (sessionId) {
    socket.join(`session:${sessionId}`);
  }
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
 
// View Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
const mongo_url =process.env.MONGO_URL;
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

// Schedule a cron job to delete empty chats every 1 minute
cron.schedule("*/15 * * * *", async () => {
  console.log("Running cron job to delete empty chats...");
  try {
    const result = await UserDailyChat.deleteMany({ chats: { $size: 0 } });

    if (result.deletedCount > 0) {
      console.log(`🗑 Deleted ${result.deletedCount} empty chats`);
    }
  } catch (err) {
    console.error("Error deleting empty chats:", err);
  }
});
// Express Session
app.use(
  session({
    store,
    secret: process.env.SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6 * 24 * 60 * 60 * 1000, httpOnly: true , sameSite: 'lax'},
  })
);

// Flash Messages
app.use(flash());

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// react landing page
app.use(express.static(path.join(__dirname, "landing/dist")));

// node and react run on different ports
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to Check If User Is Logged In
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

// Global Middleware
app.use((req, res, next) => {
  if (!req.session.chatSessionId) {
    req.session.chatSessionId = require("uuid").v4();
    //console.log("New session ID generated:", req.session.chatSessionId);
  }
  res.locals.sessionId = req.session.chatSessionId;
  res.locals.user = req.user || null;
  //res.locals.currchatId = req.session.chatSessionId;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  
  next();
});

// Routes

//app.get("/", requireAuth, main.home);
const landingIndexPath = path.join(__dirname, "landing/dist/index.html");

app.get("/", (req, res) => {
  if (!fs.existsSync(landingIndexPath)) {
    return res.status(503).send("Landing build not found. Run npm run build before starting server.");
  }

  res.sendFile(landingIndexPath);
});

//app.get("/test", async(req, res) => res.render("chatHistory.ejs"));
app.get("/login", main.login);
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    success: true,
    failureFlash: "Invailid username or password.",
    successFlash: "Welcome back!",
    }),
  main.loginPost
);

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid email or password.",
      });
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      return res.json({
        success: true,
        redirectTo: "/addapi",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    req.logIn(registeredUser, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ success: false, message: "Sign up succeeded but auto-login failed." });
      }

      return res.status(201).json({
        success: true,
        redirectTo: "/addapi",
      });
    });
  } catch (err) {
    console.error("Signup API error:", err);
    res.status(500).json({
      success: false,
      message: "Error signing up. Try again.",
    });
  }
});
// react auth recognizer
app.get("/api/check-auth", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
      },
    });
  }

  res.json({ authenticated: false });
});


app.get("/signup", main.signup);
app.post("/signup", main.signupPost);
app.get("/logout", main.logout);

app.get("/chat-history/:id", main.chatHistory);
app.delete("/chat-history/delete/:id", main.deleteChatHistory);
app.post("/api/openai", openai.getCompletion);
app.post("/api/openai/stream", openai.getCompletionStream);
app.post("/api/gimini", Gemini.giminiapi);
app.post("/api/gimini/stream", Gemini.giminiapiStream);
app.post("/api/deepseek", deepseek.deepseekapi);
app.post("/api/deepseek/stream", deepseek.deepseekapiStream);
app.get("/multiGPT", requireAuth, main.home);
app.get("/addapi", requireAuth, main.addApiPage);
app.post("/addapikey", requireAuth, main.addApiKey);


app.get("/api/chat", requireAuth, savechat.chat);
app.post("/api/req", savechat.api);
app.get("/api/newchat", newChat.startNewChat);
app.post("/api/end-session", savechat.endChat);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
