import express from "express";
import Notification from "../models/notification.js";
// import auth from "../middleware/auth.js";
import { protect } from "../middleware/autMiddleware.js";

const router = express.Router();

// GET /api/notifications
// router.get("/", protect, async (req, res) => {
//   try {
//     const notifications = await Notification.find({
//       $or: [{ user: req.user._id }, { role: req.user.role }],
//       deletedBy: { $ne: req.user._id }, // ✅ hide those deleted by this user
//     }).sort({ createdAt: -1 });

//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.get("/", protect, async (req, res) => {
  try {
    const baseHide = { deletedBy: { $ne: req.user._id } };

    let query;

    if (req.user.role === "user") {
      // ✅ users only see their own personal notifications
      query = { user: req.user._id, ...baseHide };
    } else {
      // ✅ staff/admin see: their personal + their role broadcast
      query = {
        $or: [{ user: req.user._id }, { role: req.user.role }],
        ...baseHide,
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.log("GET NOTIF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const n = await Notification.findById(req.params.id);
//     if (!n) return res.status(404).json({ message: "Notification not found" });

//     const isOwner = n.user && String(n.user) === String(req.user._id);
//     const isAdmin = ["admin", "super_admin"].includes(req.user.role);

//     // ✅ personal notification: owner can hard delete
//     if (isOwner) {
//       await Notification.deleteOne({ _id: n._id });
//       return res.json({ success: true, message: "Deleted" });
//     }

//     // ✅ role notification: any user can "hide" it for themselves
//     if (n.role) {
//       await Notification.updateOne(
//         { _id: n._id },
//         { $addToSet: { deletedBy: req.user._id } } // ✅ hide only for this user
//       );
//       return res.json({ success: true, message: "Hidden for you" });
//     }

//     // ✅ admin can hard delete anything if you want
//     if (isAdmin) {
//       await Notification.deleteOne({ _id: n._id });
//       return res.json({ success: true, message: "Deleted by admin" });
//     }

//     return res.status(403).json({ message: "Not allowed" });
//   } catch (err) {
//     console.log("DELETE Notification ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.delete("/:id", protect, async (req, res) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: "Notification not found" });

    const isOwner = n.user && String(n.user) === String(req.user._id);
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);

    // ✅ Personal notification => owner can hard delete
    if (isOwner) {
      await Notification.deleteOne({ _id: n._id });
      return res.json({ success: true, message: "Deleted" });
    }

    // ✅ Role notification => hide for this user
    if (n.role) {
      await Notification.updateOne(
        { _id: n._id },
        { $addToSet: { deletedBy: req.user._id } }
      );
      return res.json({ success: true, message: "Hidden for you" });
    }

    // ✅ Admin can delete anything (optional)
    if (isAdmin) {
      await Notification.deleteOne({ _id: n._id });
      return res.json({ success: true, message: "Deleted by admin" });
    }

    return res.status(403).json({ message: "Not allowed" });
  } catch (err) {
    console.log("DELETE Notification ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
