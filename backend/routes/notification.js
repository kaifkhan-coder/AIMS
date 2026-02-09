import express from "express";
import Notification from "../models/notification.js";
// import auth from "../middleware/auth.js";
import { protect } from "../middleware/autMiddleware.js";

const router = express.Router();

// GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { user: req.user.id },
        { role: req.user.role }
      ]
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
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

router.delete("/:id", protect, async (req, res) => {
  try{
    const notification = await Notification.findOneAndDelete(req.params.id);
    _id: req.params.id
    user: req.user.id

    if(!notification){
      return res.status(404).json({message: "Notification not found"});
    }
  }
  catch(err){
    return res.status(500).json({message: "Server error"});

  }
  
});
export default router;
