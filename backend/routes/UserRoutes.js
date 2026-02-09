import multer from "multer";
import express from "express";
import { protect } from "../middleware/autMiddleware.js";
import bcrypt from "bcryptjs";
const router = express.Router();
import User from "../models/User.js";
import { getTicketStats } from "../controllers/userController.js";
import Notification from "../models/notification.js";
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {
  try {
    console.log("User routes loaded");
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      ...user.toObject(),
      unreadCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "User route working" });
});

router.get("/profile", protect, async (req, res) => {
  res.json(req.user);
});

router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.full_name = req.body.full_name || user.full_name;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// router.get("/profile", protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user);

//   } catch (err) {
//     console.error("GET PROFILE ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/ticket-stats", protect, getTicketStats);

router.put("/change-password", protect, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 🔴 IMPORTANT: fetch password explicitly
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Wrong old password" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
});

export default router;