import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, adminOnly, roleCheck } from "../middleware/autMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import { createStaff, deleteStaff, getAllIncidentsForAdmin, getLlmAccuracy, reassignDepartment, getAdminStats, getMostActiveStaff, getIncidentByDepartment, getAvgResolutionTime, reassignStaffDepartment, reassignTicketDepartment} from "../controllers/adminController.js";
import { otpEmailTemplate } from "../utils/emailTemplates.js";
import { classifyIncident } from "../llmService.js";
import { getAssignedTickets } from "../controllers/ticketController.js";
import Ticket from "../models/Ticket.js";
import AuditLog from "../models/AuditLog.js";
const router = express.Router();

router.get("/incidents", protect, roleCheck("admin"), getAllIncidentsForAdmin);

router.post("/create-staff", protect, adminOnly, createStaff);

router.get("/staff", protect, adminOnly, async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select("full_name email department isVerified");

    res.json(staff);
  } catch (err) {
    console.error("FETCH STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/audit-logs", protect, adminOnly, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("updatedBy", "username")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error("AUDIT LOG ERROR:", err);
    res.status(500).json({ message: "Failed to load audit logs" });
  }
});

router.put
("/reassign-staff/:id", protect, adminOnly, reassignStaffDepartment);

router.put("/tickets/:id/department", protect, adminOnly, reassignTicketDepartment);

router.get("/stats", protect, adminOnly, getAdminStats);  

router.get("/stats/active-staff", protect, adminOnly, getMostActiveStaff);

router.get("/stats/incidents-by-dept", protect, adminOnly, getIncidentByDepartment);

router.get("/stats/avg-resolution", protect, adminOnly, getAvgResolutionTime);

router.get("/llm-accuracy", protect, adminOnly, getLlmAccuracy);

router.post("/reassign-department/:id", protect, adminOnly, reassignDepartment)

router.get(
  "/assigned",
  protect,        // JWT middleware
  getAssignedTickets
);

router.put(
  "/tickets/:id/department",
  protect,
  adminOnly,
  roleCheck("admin"),
  reassignDepartment
);

router.post("/", protect, async (req, res) => {
  const ticket = await Ticket.create({
    title: req.body.title,
    description: req.body.description,
    department: req.body.department,
    createdBy: req.user.id // 🔒 CRITICAL
  });

  res.status(201).json(ticket);
});

router.delete("/staff/:id", protect, adminOnly, deleteStaff);

router.put("/staff/:id", protect, adminOnly, async (req, res) => {
  try {
    const { full_name, department } = req.body;
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }
    staff.full_name = full_name || staff.full_name;
    // staff.email = email || staff.email;
    staff.department = department || staff.department;
    await staff.save();
    res.json({ message: "Staff updated successfully", staff });
  } catch (err) {
    console.error("UPDATE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  const tickets = await Incident.find()
    .populate("createdBy", "username email");

  res.json(tickets);
});

/* ===============================
   ✅ RESEND OTP
================================ */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found or already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "Resend OTP - Verify Your Account",
      otpEmailTemplate(otp, email)
    );

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
