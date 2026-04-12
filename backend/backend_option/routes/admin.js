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
import Incident from "../models/incident.js";
import AuditLog from "../models/AuditLog.js";
// import { sendStaffOtp } from "../controllers/sendStaffOtp.js";
// import { verifyOtpWithToken } from "../controllers/VerifyOtpWithToken.js";
const router = express.Router();

router.get("/incidents", protect, roleCheck("admin"), getAllIncidentsForAdmin);

router.post("/create-staff", protect, adminOnly, createStaff);

router.get("/staff", protect, adminOnly, async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" })
      .select("full_name email department isVerified isActive qrCode");

    console.log("STAFF COUNT:", staff.length);
    console.log("FIRST STAFF QR:", staff[0]?.qrCode?.substring(0, 30));
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    res.json(staff);
  } catch (err) {
    console.error("FETCH STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// router.post("/staff/send-otp", sendStaffOtp);
// router.post("/staff/verify-otp", verifyOtpWithToken);

router.put("/staff/:id/deactivate", protect, adminOnly, async (req,res)=>{
  const staff = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  
  await AuditLog.create({
  action: "STAFF_DEACTIVATED",
  updatedBy: req.user._id,
  details: {
    staffId: staff._id,
    full_name: staff.full_name,
    email: staff.email,
  },
});
  
  res.json(staff);
});
router.put("/staff/:id/activate", protect, adminOnly, async (req,res)=>{
  const staff = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  await AuditLog.create({
  action: "STAFF_ACTIVATED",
  updatedBy: req.user._id,
  details: {
    staffId: staff._id,
    full_name: staff.full_name,
    email: staff.email,
  },
});
  res.json(staff);
});

router.get("/verify/:staffId", async (req, res) => {
  const { staffId } = req.params;

  await Incident.findOneAndUpdate(
    { assignedTo: staffId, status: "In Progress" },
    { status: "Resolved", verified: true, resolvedAt: new Date() }
  );

  res.send("✅ Verified Successfully");
});

router.get("/test-qr", protect, adminOnly, async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" });
    console.log("TOTAL STAFF:", staff.length);
    console.log("SAMPLE STAFF:", staff[0]);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    
    res.json({
      totalStaff: staff.length,
      sampleId: staff[0]?._id,
      qrCodeExists: !!staff[0]?.qrCode,
      frontendUrl: process.env.FRONTEND_URL
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/staff-workload", protect, adminOnly, async (req, res) => {
  const data = await Incident.aggregate([
    { $match: { assignedTo: { $ne: null }, status: { $in: ["Open", "In Progress", "Pending"] } } },
    { $group: { _id: "$assignedTo", openCount: { $sum: 1 } } },
    { $sort: { openCount: -1 } },
    { $limit: 50 }
  ]);

  res.json(data);
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

router.get("/stats", protect, adminOnly, getAdminStats);  

router.get("/stats/active-staff", protect, adminOnly, getMostActiveStaff);

router.get("/stats/incidents-by-dept", protect, adminOnly, getIncidentByDepartment);

router.get("/stats/avg-resolution", protect, adminOnly, getAvgResolutionTime);

router.get("/llm-accuracy", protect, adminOnly, getLlmAccuracy);

router.post("/reassign-department/:id", protect, adminOnly, reassignDepartment)

// router.get(
//   "/assigned",
//   protect,        // JWT middleware
//   getAssignedTickets
// );
import mongoose from "mongoose";

router.get("/assigned", protect, async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);

    const staffId = req.user?.id || req.user?._id;
    if (!staffId) {
      return res.status(401).json({ message: "User id missing in token" });
    }

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const incidents = await Incident.find({
      assignedTo: new mongoose.Types.ObjectId(staffId),
    }).sort({ createdAt: -1 });

    return res.json({ tickets: incidents });
  } catch (err) {
    console.error("ASSIGNED ROUTE ERROR:", err);
    return res.status(500).json({ message: "Failed to load assigned tickets" });
  }
});


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

import QRCode from "qrcode";

router.get("/fix-all-qr", async (req, res) => {
  try {
    const staffList = await User.find({ role: "staff" });
    console.log("Found staff:", staffList.length);
    
    for (const s of staffList) {
      const qrData = `http://localhost:5173/verify/${s._id}`;
      s.qrCode = await QRCode.toDataURL(qrData);
      await s.save();
      console.log("QR saved for:", s.full_name);
    }
    
    res.json({ message: "Done", count: staffList.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

