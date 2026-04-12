// import multer from "multer";
// import express from "express";
// import { protect } from "../middleware/autMiddleware.js";
// import bcrypt from "bcryptjs";
// const router = express.Router();
// import User from "../models/User.js";
// import { getTicketStats } from "../controllers/userController.js";
// import Notification from "../models/notification.js";
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (_, file, cb) =>
//     cb(null, Date.now() + "-" + file.originalname),
// });

// const upload = multer({ storage });
// console.log("✅ UserRoutes loaded");
// router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {
//   try {
//     console.log("User routes loaded");
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.profilePhoto = `/uploads/${req.file.filename}`;
//     await user.save();

//     const unreadCount = await Notification.countDocuments({
//       user: req.user._id,
//       isRead: false
//     });

//     res.json({
//       ...user.toObject(),
//       unreadCount
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Upload failed" });
//   }
// });

// router.get("/test", (req, res) => {
//   res.json({ message: "User route working" });
// });


// // router.put("/profile", protect, async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     user.full_name = req.body.full_name || user.full_name;
// //     user.username = req.body.username || user.username;
// //     user.email = req.body.email || user.email;

// //     await user.save();

// //     res.json({
// //       message: "Profile updated successfully",
// //       user,
// //     });
// //   } catch (err) {
// //     console.error("PROFILE UPDATE ERROR:", err);
// //     res.status(500).json({ message: "Update failed" });
// //   }
// // });


// // router.get("/profile", protect, async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.id).select("-password");

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     res.json(user);

// //   } catch (err) {
// //     console.error("GET PROFILE ERROR:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });

// router.get("/ticket-stats", protect, getTicketStats);


// router.get("/profile", protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const unreadCount = await Notification.countDocuments({
//       user: req.user._id,
//       isRead: false
//     });

//     res.json({ ...user.toObject(), unreadCount });
//   } catch (err) {
//     console.error("GET PROFILE ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.put("/profile", protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.full_name = req.body.full_name || user.full_name;
//     user.username = req.body.username || user.username;
//     user.email = req.body.email || user.email;

//     await user.save();

//     res.json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (err) {
//     console.error("PROFILE UPDATE ERROR:", err);
//     res.status(500).json({ message: "Update failed" });
//   }
// });

// router.put("/change-password", protect, async (req, res) => {
//   const { oldPassword, newPassword } = req.body;

//   if (!oldPassword || !newPassword) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const user = await User.findById(req.user._id).select("+password");

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   const isMatch = await bcrypt.compare(oldPassword, user.password);
//   if (!isMatch) {
//     return res.status(400).json({ message: "Wrong old password" });
//   }

//   user.password = await bcrypt.hash(newPassword, 10);
//   await user.save();

//   res.json({ message: "Password changed successfully" });
// });

// export default router;

import multer from "multer";
import express from "express";
import bcrypt from "bcryptjs";
import { protect } from "../middleware/autMiddleware.js";
import User from "../models/User.js";
import { getTicketStats } from "../controllers/userController.js";
import Notification from "../models/notification.js";

const router = express.Router();

/* ---------------- MULTER ---------------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

console.log("✅ UserRoutes loaded");

/* ---------------- TEST ---------------- */
router.get("/test", (req, res) => {
  res.json({ message: "User route working" });
});

/* ---------------- GET PROFILE ---------------- */
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.json({
      ...user.toObject(),
      unreadCount,
    });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- UPDATE PROFILE ---------------- */
router.put("/profile", protect, async (req, res) => {
  try {
    const { full_name, username, email } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check username uniqueness
    if (username && username.trim().toLowerCase() !== user.username) {
      const existingUsername = await User.findOne({
        username: username.trim().toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      user.username = username.trim().toLowerCase();
    }

    // check email uniqueness
    if (email && email.trim().toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = email.trim().toLowerCase();
    }

    if (full_name) {
      user.full_name = full_name.trim();
    }

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ---------------- UPLOAD PROFILE PHOTO ---------------- */
router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {
  try {
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
      user: req.user._id,
      isRead: false,
    });

    res.json({
      message: "Photo uploaded successfully",
      user: {
        ...user.toObject(),
        unreadCount,
      },
    });
  } catch (err) {
    console.error("UPLOAD PHOTO ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ---------------- CHANGE PASSWORD ---------------- */
router.put("/change-password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
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
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- TICKET STATS ---------------- */
router.get("/ticket-stats", protect, getTicketStats);

export default router;