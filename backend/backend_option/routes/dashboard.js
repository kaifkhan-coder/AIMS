import express from "express";
import { protect, roleCheck } from "../middleware/autMiddleware.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const router = express.Router();

/* ================= ADMIN DASHBOARD ================= */
router.get(
  "/admin",
  protect,
  roleCheck("admin"),
  async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const breachedTickets = await Ticket.countDocuments({ status: "sla-breached" });

    res.json({
      role: "admin",
      totalUsers,
      totalTickets,
      breachedTickets
    });
  }
);

router.get(
  "/staff",
  protect,
  roleCheck("staff", "admin"),
  async (req, res) => {
    const assignedTickets = await Ticket.find({
      assignedTo: req.user._id
    });

    res.json({
      role: "staff",
      assignedTickets
    });
  }
);

export default router;
