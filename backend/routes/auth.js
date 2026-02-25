import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {generateToken} from '../utils/generateToken.js';
import { otpEmailTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/sendEmail.js";
import {protect, roleCheck} from "../middleware/autMiddleware.js";
import jwt from "jsonwebtoken";
import { generateHashedOTP } from "../utils/otp.js";
import {getMyIncidents} from '../controllers/incidentController.js';
import { verifyAdminOTP } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, username, password } = req.body;

    if (!full_name || !email || !username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const usernameNormalized = username.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      full_name,
      email,
      username: usernameNormalized,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.trim().toLowerCase();
    
const user = await User.findOne({
  $or: [
    { username },
    { email: username } // allow email login
  ]
});
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ✅ VERIFICATION CHECK HERE
 // AFTER password match
if (user.role === "staff" && !user.isVerified) {
  return res.status(403).json({
    message: "Account not verified. Please verify OTP."
  });
}
if (!user.isActive) return res.status(403).json({ message: "Account deactivated" });

if (user.role === "admin" && user.twoFactorEnabled) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.twoFactorOTP = otp;
  user.twoFactorExpiry = Date.now() + 5 * 60 * 1000; // 5 min
  await user.save();

  await sendEmail(
    user.email,
    "Admin Login OTP",
    `Your OTP is: ${otp}`
  );

  return res.json({
    twoFactorRequired: true,
    userId: user._id,
  });
}

router.post("/verify-face", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { image } = req.body;

    // 🔥 Compare with stored admin face embedding
    const isMatch = await compareFaces(image, req.user._id);

    if (!isMatch) {
      return res.json({ success: false });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Face verification failed" });
  }
});

router.post("/verify-otp", verifyAdminOTP);

console.log("LOGIN USER:", user.username, user.role);

    res.json({
      token: generateToken(user),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/staff", protect, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Admin access only" });
//     }

//     const staff = await User.find({ role: "staff" })
//       .select("username email isVerified");

//     res.json(staff);

//   } catch (err) {
//     console.error("ADMIN STAFF ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // 🔒 LOCK CHECK
    if (user.otpLockedUntil && user.otpLockedUntil > Date.now()) {
      return res.status(403).json({
        message: "Too many attempts. Try again later."
      });
    }

    // ⏳ EXPIRY CHECK
    if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 🔐 OTP CHECK
    const isMatch = await bcrypt.compare(otp.trim(), user.otp);
    if (!isMatch) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;

      if (user.otpAttempts >= 5) {
        user.otpLockedUntil = Date.now() + 30 * 60 * 1000;
      }

      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ VERIFIED
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentAt = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();

    // ✅ JWT TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Staff verified successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Already verified" });
    }

    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt < 30_000) {
      return res.status(429).json({
        message: "Please wait 30 seconds before resending OTP"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp; // ✅ FIXED
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.lastOtpSentAt = Date.now();
    user.otpAttempts = 0;

    await user.save();

    await sendEmail(
      user.email,
      "Resend OTP - Verify Account",
      otpEmailTemplate(otp, user.email)
    );

    res.json({ message: "OTP resent successfully" });

  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/otp-status/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user || !user.otpExpires) {
      return res.json({ otpExpires: null });
    }

    res.json({
        status: "active",
      expiresAt: user.otpExpires
    });

  } catch (err) {
    console.error("OTP STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/admin", protect, roleCheck("admin"), handler);

// router.get("/staff", protect, roleCheck("staff", "admin"), handler);
router.get("/staff", protect, roleCheck("staff", "admin"), (req, res) => {
  res.json({
    message: "Welcome Staff",
    user: req.user
  });
});

router.post("/:id/comment", protect, async (req, res) => {
  const ticket = await Incident.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Not found" });

  ticket.comments.push({
    message: req.body.message,
    role: req.user.role,
    userId: req.user._id
  });

  await ticket.save();
  res.json(ticket.comments);
});

router.get("/", protect, getMyIncidents);

// router.get("/my", protect, async (req, res) => {
//   try {
//     const tickets = await Ticket.find({ createdBy: req.user._id })
//       .sort({ createdAt: -1 });

//     res.json(tickets);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load tickets" });
//   }
// });

// router.get("/:id", protect, async (req, res) => {
//   try {
//     const ticket = await Ticket.findById(req.params.id)
//       .populate("createdBy", "username role")
//       .populate("assignedTo", "username role");

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     res.json(ticket);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load ticket" });
//   }
// });

// router.post("/:id/comment", protect, async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ message: "Comment required" });
//   }

//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     ticket.comments.push({
//       message,
//       user: req.user._id,
//       role: req.user.role,
//     });

//     await ticket.save();

//     res.json({ message: "Comment added", comments: ticket.comments });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to add comment" });
//   }
// });

// router.put("/:id/status", protect, async (req, res) => {
//   const { status } = req.body;

//   if (!["open", "in-progress", "resolved", "closed"].includes(status)) {
//     return res.status(400).json({ message: "Invalid status" });
//   }

//   if (req.user.role === "user") {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   try {
//     const ticket = await Ticket.findById(req.params.id);

//     if (!ticket) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     ticket.status = status;
//     await ticket.save();

//     res.json({ message: "Status updated", ticket });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update status" });
//   }
// });



export default router;