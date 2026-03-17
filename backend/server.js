import dotenv from "dotenv";
dotenv.config();  
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import bcrypt from "bcryptjs";
import path from "path";
import jwt from "jsonwebtoken";

import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";

import { Server } from "socket.io";
import { initSocket } from "./socket.js";
import { startAutoCloseJob } from "./jobs/autoCloseIncidents.js";

import { runEscalationJob } from "./jobs/escalationJob.js";
import accountAppealRoutes from "./routes/accountAppealRoutes.js";
import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incident.js";
import adminRoutes from "./routes/admin.js";
import dashboardRoutes from "./routes/dashboard.js";
import notificationRoutes from "./routes/notification.js";
import aiRoutes from "./routes/ai.js";
import userRoutes from "./routes/UserRoutes.js";
import llmRoutes from "./routes/llm.js";
import bootstrapRoutes from "./routes/bootstrap.js";
import superadminRoutes from "./routes/superadminRoutes.js";

import User from "./models/User.js";
// import { checkSlaBreach } from "./services/slaWatcher.js";
import { runSlaPredictor } from "./controllers/slaPredictJob.js";
import ticketRoutes from "./routes/tickets.js";
import "./utils/slaJob.js";

// console.log("JWT_SECRET:", process.env.JWT_SECRET);
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: "oauthsecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

startAutoCloseJob();
/* ---------------- MONGODB CONNECT ---------------- */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 🔐 Create default admin
    const adminExists = await User.findOne({ username: "admin1" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await User.create({
        full_name: "Admin One",
        email: "khan.kaif.new@gmail.com",
        username: "admin1",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Admin created: admin1 / admin123");
    }

  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  }
};

await connectDB();

app.set("io", io);

app.get("/", (req, res) => {
  res.send("Backend Working 🚀");
});


// 1️⃣ Socket auth middleware FIRST
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("NO_TOKEN"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("INVALID_TOKEN"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // personal room
  socket.join(String(socket.user.id || socket.user._id));

  // role room
  if (socket.user.role) {
    socket.join(socket.user.role); // admin / staff / user / super_admin
  }

  // optional department room
  if (socket.user.department) {
    socket.join(`dept:${socket.user.department}`);
  }

  socket.on("join_room", ({ role }) => {
    if (role) {
      socket.join(role);
      console.log(`✅ Socket ${socket.id} joined room: ${role}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// 2️⃣ Connection handler AFTER middleware


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "${import.meta.env.VITE_API_URL}/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        username: profile.emails[0].value.split("@")[0].toLowerCase(),
        googleId: profile.id,
        full_name: profile.displayName,
        email: profile.emails[0].value,
        isVerified: true,
        role: "user",
        password: Math.random().toString(36).slice(-8) // Random password
      });
    }
      else if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "${import.meta.env.VITE_API_URL}/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0]
      ? profile.emails[0].value
      : `${profile.username}@github.com`;

    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        full_name: profile.displayName || profile.username,
        username: profile.username,
        githubId: profile.id,
        email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
        isVerified: true,
        role: "user",
        password: Math.random().toString(36).slice(-8) // Random password
      });
    }
    else if (!user.githubId) {
      user.githubId = profile.id;
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.get("/auth/google",
  passport.authenticate("google", {
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ]
  })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
  res.redirect("http://localhost:5173/user")
  }
);

// GitHub Auth Routes
app.get("/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login.html" }),
  (req, res) => {
  res.redirect("http://localhost:5173/user")
  }
);

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/tickets", ticketRoutes);  
app.use("/api/notifications", notificationRoutes)
app.use("/api/ai", aiRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/llm", llmRoutes);
app.use("/api/bootstrap", bootstrapRoutes);
app.use("/api/account-appeals", accountAppealRoutes);
app.use("/api/superadmin", superadminRoutes);
/* ---------------- SLA WATCHER ---------------- */
setInterval(() => {
  runSlaPredictor(io);
}, 60000);

setInterval(() => {
  runEscalationJob(io);
}, 60000);
/* ---------------- START SERVER ---------------- */
server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});