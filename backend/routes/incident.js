// import express from "express";
// import multer from "multer";
// import mongoose from "mongoose";
// import User from "../models/User.js";
// import Incident from "../models/incident.js";
// import Notification from "../models/notification.js";
// import KnowledgeBase from "../models/KnowledgeBase.js";
// import { generateShayari, askLLM } from "../llmService.js";
// import AuditLog from "../models/AuditLog.js";
// import {
//   createIncident,
//   getIncidentById,
//   addComment,
//   getMyIncidents,
//   markResolved,
//   updateDepartment,
//   updateIncidentStatus,
//   downloadIncidentReport,
//   predictSlaRisk,
//   getHeatmapStats,
//   getSolutionSuggestions,
//   getRootCause,
//   approveCloseIncident,
//   rejectCloseIncident,
//   sendResolutionOTP,
//   verifyResolutionOTP,
//   resendOtp,
// } from "../controllers/incidentController.js";
// import { adminOnly, protect, roleCheck } from "../middleware/autMiddleware.js";

// const router = express.Router();

// const extractKeywords = (text = "") => {
//   return text
//     .toLowerCase()
//     .split(/\W+/)
//     .filter((w) => w.length > 3);
// };

// const buildTicketId = () =>
//   `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// import QRCode from "qrcode";

// // Ticket create hone pe QR generate karke staff ko bhejne ka code yahan add kar sakte ho, agar chahiye toh. QR code mein ticket details ya URL ho sakta hai jisse staff easily access kar sake ticket ko scan karke.   

// // Ticket resolve route
// router.put("/resolve/:id", async (req, res) => {
//   try {
//     let incident = await Incident.findById(req.params.id);

//     if (!incident) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // ✅ Update status
//     incident.status = "Resolved";
//     incident.resolvedAt = new Date();

//     // ✅ Generate shayari if not exists
//     if (!incident.closingShayari) {
//       const prompt = `
// Write a short Hinglish shayari for resolved IT ticket:
// Title: ${incident.title}
// Department: ${incident.department}
// `;
//       const result = await askLLM(prompt);
//       incident.closingShayari = result;
//     }

//     await incident.save();

//     res.json({ message: "Resolved", incident });

//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* ===============================
//    ASSIGNED TICKETS
// ================================ */
// router.get("/attachment/:filename", protect, async (req, res) => {
//   try {
//     if (!["admin", "staff", "super_admin"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const filePath = path.join(process.cwd(), "uploads", req.params.filename);

//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     return res.sendFile(filePath);
//   } catch (err) {
//     console.error("ATTACHMENT ACCESS ERROR:", err);
//     return res.status(500).json({ message: "Failed to open file" });
//   }
// });

// router.get("/assigned", protect, async (req, res) => {
//   try {
//     const staffId = req.user?._id || req.user?.id;

//     if (!staffId) {
//       return res.status(401).json({ message: "No user id in token" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(staffId)) {
//       return res.status(400).json({ message: "Invalid user id" });
//     }

//     const incidents = await Incident.find({
//       assignedTo: new mongoose.Types.ObjectId(staffId),
//     }).sort({ createdAt: -1 });

//     return res.json({ tickets: incidents });
//   } catch (err) {
//     console.error("ASSIGNED ERROR:", err);
//     return res.status(500).json({ message: "Failed to load assigned tickets" });
//   }
// });

// /* ===============================
//    MY INCIDENTS
// ================================ */
// router.get("/my", protect, getMyIncidents);
// router.post("/root-cause", protect, getRootCause); //1 new endpoint for root cause analysis
// /* ===============================
//    AUTO INCIDENT CREATE
// ================================ */
// router.post("/auto", async (req, res) => {
//   try {
//     const {
//       title = "Network Down",
//       description = "Network connectivity lost (auto detected)",
//       priority = "High",
//       category = "Network",
//     } = req.body;

//     const existing = await Incident.findOne({
//       title,
//       status: { $ne: "Closed" },
//     });

//     if (existing) {
//       return res.json({ message: "Incident already exists", incident: existing });
//     }

//     const systemUser = await User.findOne({
//       role: { $in: ["admin", "super_admin"] },
//     }).select("_id");

//     if (!systemUser) {
//       return res.status(500).json({
//         message: "No system/admin user found for auto incident creation",
//       });
//     }

//     const incident = await Incident.create({
//       ticketId: buildTicketId(),
//       title,
//       description,
//       priority,
//       category,
//       department: "Network",
//       status: "Open",
//       createdBy: systemUser._id,
//       source: "AUTO_MONITOR",
//       normalizedText: `${title} ${category} ${description}`.toLowerCase(),
//       fingerprint: `${title}-${description}-${Date.now()}`,
//     });

//     const networkStaff = await User.findOne({
//       role: "staff",
//       department: "Network",
//       isActive: true,
//     }).select("_id full_name");

//     if (networkStaff) {
//       incident.assignedTo = networkStaff._id;
//       await incident.save();
//     }

//     await Notification.create({
//       role: "staff",
//       message: `🚨 AUTO ALERT: ${incident.title}`,
//     });

//     res.status(201).json({
//       message: "Auto incident created",
//       incident,
//     });
//   } catch (err) {
//     console.error("AUTO CREATE ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// /* ===============================
//    AUTO INCIDENT RESOLVE
// ================================ */
// router.put("/auto/resolved", async (req, res) => {
//   try {
//     const { title } = req.body;

//     const incident = await Incident.findOneAndUpdate(
//       { title, status: { $ne: "Closed" } },
//       {
//         status: "Closed",
//         closedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!incident) {
//       return res.json({ message: "No open incident found" });
//     }

//     await Notification.create({
//       role: "admin",
//       message: `Auto Resolved ${incident.title}`,
//     });

//     res.json({
//       message: "Auto incident resolved",
//       incident,
//     });
//   } catch (err) {
//     console.error("AUTO RESOLVE ERROR:", err);
//     res.status(500).json({
//       error: err.message,
//     });
//   }
// });

// /* ===============================
//    KNOWLEDGE BASE
// ================================ */
// router.post("/solution-suggestions", protect, getSolutionSuggestions);
// router.patch("/:id/approve-close", protect, adminOnly, approveCloseIncident);
// router.patch("/:id/reject-close", protect, adminOnly, rejectCloseIncident);
// router.post("/knowledge-base/search", protect, async (req, res) => {
//   try {
//     const { query, department } = req.body;
//     const keywords = extractKeywords(query || "");

//     const articles = await KnowledgeBase.find({
//       department,
//       keywords: { $in: keywords },
//       isActive: true,
//     }).limit(5);

//     res.json(articles);
//   } catch (err) {
//     console.error("KB SEARCH ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get("/knowledge-base/:id", protect, async (req, res) => {
//   try {
//     const article = await KnowledgeBase.findById(req.params.id);

//     if (!article) {
//       return res.status(404).json({ message: "Article not found" });
//     }

//     res.json(article);
//   } catch (err) {
//     console.error("KB GET ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* ===============================
//    SLA RISK
// ================================ */
// router.get("/predict-sla-risk", protect, predictSlaRisk);

// /* ===============================
//    FEEDBACK
// ================================ */
// router.post("/feedback", protect, async (req, res) => {
//   try {
//     const { incidentId, rating, comment } = req.body;

//     if (!incidentId || !rating) {
//       return res.status(400).json({ message: "incidentId and rating are required" });
//     }

//     const incident = await Incident.findById(incidentId);
//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     if (String(incident.createdBy) !== String(req.user._id)) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     if (incident.status !== "Resolved" && incident.status !== "Closed") {
//       return res.status(400).json({
//         message: "Feedback allowed only for resolved or closed incidents",
//       });
//     }

//     incident.feedback = {
//       rating: Number(rating),
//       comment: comment || "",
//       submittedBy: req.user._id,
//       submittedAt: new Date(),
//     };

//     await incident.save();

// await AuditLog.create({
//   action: "FEEDBACK_SUBMITTED",
//   incidentId: incident._id,
//   updatedBy: req.user._id,
//   details: {
//     ticketId: incident.ticketId,
//     rating: Number(rating),
//     resolvedCompletely: resolvedCompletely || "",
//     responseSpeed: responseSpeed || "",
//     staffBehavior: staffBehavior || "",
//     recommendSupport: recommendSupport || "",
//   },
// });
//     res.json({
//       message: "Feedback submitted successfully",
//       incident,
//     });
//   } catch (err) {
//     console.error("FEEDBACK ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* ===============================
//    ADMIN ACTIONS
// ================================ */

// router.patch("/:id/reopen", protect, async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const incident = await Incident.findById(req.params.id);

//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     if (!["Resolved", "Closed"].includes(incident.status)) {
//       return res.status(400).json({
//         message: "Only resolved/closed incidents can be reopened",
//       });
//     }

//     incident.status = "Open";
//     incident.reopenCount += 1;
//     incident.reopenedAt = new Date();
//     incident.reopenReason = reason || "Issue still exists";
//     await incident.save();

//     await AuditLog.create({
//   action: "TICKET_REOPENED",
//   incidentId: incident._id,
//   updatedBy: req.user._id,
//   details: {
//     ticketId: incident.ticketId,
//     reopenReason: reason || "",
//     previousStatus: "Resolved",
//     newStatus: "Reopened",
//   },
// });
//     res.json({ message: "Ticket reopened", incident });
//   } catch (err) {
//     console.error("REOPEN ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /* ===============================
//    STATS
// ================================ */
// router.get("/stats-heatmap", protect, adminOnly, getHeatmapStats);

// router.get("/:id/report", protect, downloadIncidentReport);

// router.post("/", protect, upload.single("attachment"), createIncident);
// router.post("/:id/comment", protect, addComment);

// router.put("/:id/status", protect, roleCheck("user" ,"admin", "staff", "super_admin"), updateIncidentStatus);
// router.put("/:id/department", protect, roleCheck("admin", "super_admin"), updateDepartment);
// router.get("/:id", protect, getIncidentById);
// router.post("/:id/send-otp", protect, sendResolutionOTP);
// router.post("/:id/verify-otp", protect, verifyResolutionOTP);
// router.post("/:id/resend-otp", protect, resendOtp);
// export default router;

// =========================================================
// 1. IMPORTS (All dependencies properly grouped at the top)
// =========================================================
import fs from "fs";          // Added missing import
import path from "path";      // Added missing import
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import QRCode from "qrcode";  // Moved from the middle of the file

// Models
import User from "../models/User.js";
import Incident from "../models/incident.js";
import Notification from "../models/notification.js";
import KnowledgeBase from "../models/KnowledgeBase.js";
import AuditLog from "../models/AuditLog.js";

// Services & Controllers
import { generateShayari, askLLM } from "../llmService.js";
import {
  createIncident,
  getIncidentById,
  addComment,
  getMyIncidents,
  markResolved,
  updateDepartment,
  updateIncidentStatus,
  downloadIncidentReport,
  predictSlaRisk,
  getHeatmapStats,
  getSolutionSuggestions,
  getRootCause,
  approveCloseIncident,
  rejectCloseIncident,
  sendResolutionOTP,
  verifyResolutionOTP,
  resendOtp,
} from "../controllers/incidentController.js";

// Middleware
import { adminOnly, protect, roleCheck } from "../middleware/autMiddleware.js";

// =========================================================
// 2. CONFIGURATION & HELPERS
// =========================================================
const router = express.Router();

const extractKeywords = (text = "") => {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
};

const buildTicketId = () =>
  `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// =========================================================
// 3. STATIC ROUTES (Must come before /:id parameterized routes)
// =========================================================

// Root specific actions
router.post("/", protect, upload.single("attachment"), createIncident);
router.get("/my", protect, getMyIncidents);
router.get("/assigned", protect, async (req, res) => {
  try {
    const staffId = req.user?._id || req.user?.id;

    if (!staffId) return res.status(401).json({ message: "No user id in token" });
    if (!mongoose.Types.ObjectId.isValid(staffId)) return res.status(400).json({ message: "Invalid user id" });

    const incidents = await Incident.find({ assignedTo: staffId }).sort({ createdAt: -1 });
    return res.json({ tickets: incidents });
  } catch (err) {
    console.error("ASSIGNED ERROR:", err);
    return res.status(500).json({ message: "Failed to load assigned tickets" });
  }
});

// Analytics & Insights
router.get("/stats-heatmap", protect, adminOnly, getHeatmapStats);
router.get("/predict-sla-risk", protect, predictSlaRisk);
router.post("/root-cause", protect, getRootCause);
router.post("/solution-suggestions", protect, getSolutionSuggestions);

// Auto incident handlers
router.post("/auto", async (req, res) => {
  try {
    const { title = "Network Down", description = "Network connectivity lost (auto detected)", priority = "High", category = "Network" } = req.body;
    
    const existing = await Incident.findOne({ title, status: { $ne: "Closed" } });
    if (existing) return res.json({ message: "Incident already exists", incident: existing });

    const systemUser = await User.findOne({ role: { $in: ["admin", "super_admin"] } }).select("_id");
    if (!systemUser) return res.status(500).json({ message: "No system/admin user found for auto incident creation" });

    const incident = await Incident.create({
      ticketId: buildTicketId(),
      title,
      description,
      priority,
      category,
      department: "Network",
      status: "Open",
      createdBy: systemUser._id,
      source: "AUTO_MONITOR",
      normalizedText: `${title} ${category} ${description}`.toLowerCase(),
      fingerprint: `${title}-${description}-${Date.now()}`,
    });

    const networkStaff = await User.findOne({ role: "staff", department: "Network", isActive: true }).select("_id full_name");
    if (networkStaff) {
      incident.assignedTo = networkStaff._id;
      await incident.save();
    }

    await Notification.create({ role: "staff", message: `🚨 AUTO ALERT: ${incident.title}` });
    res.status(201).json({ message: "Auto incident created", incident });
  } catch (err) {
    console.error("AUTO CREATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/auto/resolved", async (req, res) => {
  try {
    const { title } = req.body;
    const incident = await Incident.findOneAndUpdate(
      { title, status: { $ne: "Closed" } },
      { status: "Closed", closedAt: new Date() },
      { new: true }
    );

    if (!incident) return res.json({ message: "No open incident found" });

    await Notification.create({ role: "admin", message: `Auto Resolved ${incident.title}` });
    res.json({ message: "Auto incident resolved", incident });
  } catch (err) {
    console.error("AUTO RESOLVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Knowledge Base (Static)
router.post("/knowledge-base/search", protect, async (req, res) => {
  try {
    const { query, department } = req.body;
    const keywords = extractKeywords(query || "");

    const articles = await KnowledgeBase.find({ department, keywords: { $in: keywords }, isActive: true }).limit(5);
    res.json(articles);
  } catch (err) {
    console.error("KB SEARCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Feedback
router.post("/feedback", protect, async (req, res) => {
  try {
    // FIXED: Extracted missing properties from req.body to prevent undefined ReferenceErrors
    const { incidentId, rating, comment, resolvedCompletely, responseSpeed, staffBehavior, recommendSupport } = req.body;

    if (!incidentId || !rating) return res.status(400).json({ message: "incidentId and rating are required" });

    const incident = await Incident.findById(incidentId);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    if (String(incident.createdBy) !== String(req.user._id)) return res.status(403).json({ message: "Not allowed" });
    if (incident.status !== "Resolved" && incident.status !== "Closed") return res.status(400).json({ message: "Feedback allowed only for resolved or closed incidents" });

    incident.feedback = {
      rating: Number(rating),
      comment: comment || "",
      submittedBy: req.user._id,
      submittedAt: new Date(),
    };
    await incident.save();

    await AuditLog.create({
      action: "FEEDBACK_SUBMITTED",
      incidentId: incident._id,
      updatedBy: req.user._id,
      details: {
        ticketId: incident.ticketId,
        rating: Number(rating),
        resolvedCompletely: resolvedCompletely || "",
        responseSpeed: responseSpeed || "",
        staffBehavior: staffBehavior || "",
        recommendSupport: recommendSupport || "",
      },
    });

    res.json({ message: "Feedback submitted successfully", incident });
  } catch (err) {
    console.error("FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// 4. PREFIX-PARAMETERIZED ROUTES (E.g. /knowledge-base/:id)
// =========================================================

router.get("/knowledge-base/:id", protect, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    console.error("KB GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/attachment/:filename", protect, async (req, res) => {
  try {
    if (!["admin", "staff", "super_admin"].includes(req.user.role)) return res.status(403).json({ message: "Access denied" });
    
    const filePath = path.join(process.cwd(), "uploads", req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

    return res.sendFile(filePath);
  } catch (err) {
    console.error("ATTACHMENT ACCESS ERROR:", err);
    return res.status(500).json({ message: "Failed to open file" });
  }
});

// Ticket Resolve Route (Moved up before strict `/:id` routes)
// Ticket create hone pe QR generate karke staff ko bhejne ka code yahan add kar sakte ho.
router.put("/resolve/:id", protect, async (req, res) => { // Added missing 'protect' middleware
  try {
    let incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ message: "Ticket not found" });

    incident.status = "Resolved";
    incident.resolvedAt = new Date();

    if (!incident.closingShayari) {
      const prompt = `Write a short Hinglish shayari for resolved IT ticket: \nTitle: ${incident.title}\nDepartment: ${incident.department}`;
      incident.closingShayari = await askLLM(prompt);
    }
    await incident.save();

    res.json({ message: "Resolved", incident });
  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// =========================================================
// 5. DYNAMIC /:id ROUTES (MUST BE LAST to avoid intercepting statics)
// =========================================================

router.get("/:id", protect, getIncidentById);
router.get("/:id/report", protect, downloadIncidentReport);

router.post("/:id/comment", protect, addComment);
router.post("/:id/send-otp", protect, sendResolutionOTP);
router.post("/:id/verify-otp", protect, verifyResolutionOTP);
router.post("/:id/resend-otp", protect, resendOtp);

router.put("/:id/status", protect, roleCheck("user", "admin", "staff", "super_admin"), updateIncidentStatus);
router.put("/:id/department", protect, roleCheck("admin", "super_admin"), updateDepartment);

router.patch("/:id/approve-close", protect, adminOnly, approveCloseIncident);
router.patch("/:id/reject-close", protect, adminOnly, rejectCloseIncident);

router.patch("/:id/reopen", protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) return res.status(404).json({ message: "Incident not found" });
    if (!["Resolved", "Closed"].includes(incident.status)) return res.status(400).json({ message: "Only resolved/closed incidents can be reopened" });

    incident.status = "Open";
    incident.reopenCount += 1;
    incident.reopenedAt = new Date();
    incident.reopenReason = reason || "Issue still exists";
    await incident.save();

    await AuditLog.create({
      action: "TICKET_REOPENED",
      incidentId: incident._id,
      updatedBy: req.user._id,
      details: {
        ticketId: incident.ticketId,
        reopenReason: reason || "",
        previousStatus: "Resolved",
        newStatus: "Reopened",
      },
    });

    res.json({ message: "Ticket reopened", incident });
  } catch (err) {
    console.error("REOPEN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================
// 6. EXPORT
// =========================================================
export default router;