import express from "express";
import { protect, roleCheck } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import bcrypt from "bcryptjs";
import Ticket from "../models/Ticket.js";
const router = express.Router();

router.get(
  "/my-incidents",
  protect,
  allowRoles("staff"),
  async (req, res) => {
    const incidents = await Incident.find({ assignedTo: req.user.id });
    res.json(incidents);
  }
);

import { getStaffProfile } from "../controllers/staffController.js";

// routes/staffRoutes.js

router.put("/change-password", protect, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const isMatch = await bcrypt.compare(oldPassword, req.user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Wrong old password" });
  }

  req.user.password = await bcrypt.hash(newPassword, 10);
  await req.user.save();

  res.json({ message: "Password changed successfully" });
});


router.get("/profile", protect, roleCheck("staff"), getStaffProfile);
router.get("/staff/stats", protect, async (req, res) => {
  const resolved = await Ticket.countDocuments({
    assignedTo: req.user._id,
    status: "Resolved"
  });

  const inProgress = await Ticket.countDocuments({
    assignedTo: req.user._id,
    status: "In Progress"
  });

  res.json({ resolved, inProgress });
});

export default router;
