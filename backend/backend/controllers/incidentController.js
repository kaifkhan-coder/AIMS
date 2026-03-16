// import Incident from "../models/incident.js";
// import mongoose from "mongoose";
// import User from "../models/User.js";
// import axios from "axios";
// import Notification from "../models/notification.js";
// import { getDepartmentByCategory } from "../utils/departmentMapper.js";
// import { classifyIncident } from "../llmService.js";
// import PDFDocument from "pdfkit";
// import AuditLog from "../models/AuditLog.js";
// import { sendEmailWithAttachment } from "../utils/sendEmailStaff.js";
// import fs from "fs";
// import path from "path";
// import  sendEmail  from "../utils/sendEmail.js";
// /* ===============================
//    CREATE INCIDENT (LLM BASED)
// ================================ */
// const VALID_DEPARTMENTS = [
//   "Network",
//   "Hardware",
//   "Software",
//   "Security",
//   "General"
// ];
// const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// const normalizeDepartment = (dept) => {
//   if (!dept) return "General";
//   const normalized = dept.trim().toLowerCase();
//   const found = VALID_DEPARTMENTS.find(
//     (d) => d.toLowerCase() === normalized
//   );
//   return found || "General";
// }

// const normalizePriority = (priority) => {
//   if (!priority) return "Low";
//   const normalized = priority.trim().toLowerCase();
//   const found = VALID_PRIORITIES.find(
//     (p) => p.toLowerCase() === normalized
//   );
//   return found || "Low";
// }

// const pickBestStaff = async ({ department, category }) => {
//   const staffList = await User.find({
//     role: "staff",
//     isActive: true,
//     department
//   }).select("_id skills department");

//   if (!staffList.length) return null;

//   const staffIds = staffList.map(s => s._id);

//   // workload = OPEN + PENDING + IN_PROGRESS
//   const loads = await Incident.aggregate([
//     { $match: { assignedTo: { $in: staffIds }, status: { $in: ["Open", "Pending", "In Progress"] } } },
//     { $group: { _id: "$assignedTo", count: { $sum: 1 } } }
//   ]);

//   const loadMap = new Map(loads.map(x => [String(x._id), x.count]));

//   const cat = String(category || "").toLowerCase();

//   let best = null;
//   let bestScore = -1e9;

//   for (const s of staffList) {
//     const workload = loadMap.get(String(s._id)) || 0;

//     const skillMatch = (s.skills || []).some(sk =>
//       cat.includes(String(sk).toLowerCase())
//     ) ? 1 : 0;

//     // scoring: skill match first, then least workload
//     const score = (skillMatch * 1000) - workload;

//     if (score > bestScore) {
//       bestScore = score;
//       best = s;
//     }
//   }

//   return best?._id || null;
// };

// export const INCIDENT_STATUS = {
//   OPEN: "Open",
//   PENDING: "Pending",
//   RESOLVED: "Resolved",
//   CLOSED: "Closed",
//   IN_PROGRESS : "In Progress"
// };
// const allowedTransitions = {
//   Open: ["In Progress"],
//   "In Progress": ["Resolved"],
//   Resolved: ["Closed"],
// };

// export const createIncident = async (req, res) => {
//   try {
//     const { title, description, category } = req.body;

//     if (!title || !description) {
//       return res.status(400).json({ message: "Title and description required" });
//     }

//     const year = new Date().getFullYear();
//     const count = await Incident.countDocuments();
//     const ticketId = `INC-${year}-${count + 1}`;

//     let department = "General";
//     let priority = "Low";

//     // 🤖 LLM (optional)
//     try {
//       const llmResult = await classifyIncident(title, description);
//       department = normalizeDepartment(llmResult?.department);
//       priority = normalizePriority(llmResult?.priority);
//     } catch (err) {
//       console.log("LLM skipped", err?.message);
//     }

//     // 🎫 CREATE INCIDENT
//     const incident = await Incident.create({
//       ticketId,
//       title,
//       description,
//       category: category || "General",
//       priority,
//       department,
//       createdBy: req.user._id, // ✅ IMPORTANT
//       attachment: req.file?.filename || null,
//       status: INCIDENT_STATUS.OPEN,
//       llmMeta: {
//         originalDepartment: department,
//         updatedByAdmin: false,
//       },
//     });

//     let assignedTo = await pickBestStaff({ department, category });
//       if (!assignedTo) {
//         const fallback = await User.findOne({ role: "staff", isActive: true }).select("_id email");
//         assignedTo = assignedTo || fallback?._id;
//       }

//       if (assignedTo) {
//         incident.assignedTo = assignedTo;
//         await incident.save();
      
//         const staff = await User.findById(assignedTo).select("email full_name");
//         if (staff?.email) {
//           await sendEmail(
//             staff.email,
//             "New Ticket Assigned",  
//             `Ticket ${incident.ticketId} has been assigned to you.`
//           );

//           await Notification.create({
//             user: staff._id,
//             role: "staff",
//             message: `Your ticket ${incident.ticketId} has been assigned to you (${incident.department}).`,
//           });
//         }
//         await Notification.create({
//           role: "admin",
//           message: `New ticket ${incident.ticketId} created and assigned to ${staff?.full_name || "a staff member"}.`,
//         });
//         return res.status(201).json(incident);   
//       }

//     // 👨‍💼 AUTO ASSIGN STAFF
//     let staff = await User.findOne({ role: "staff", department });
//     if (!staff) staff = await User.findOne({ role: "staff" });

//     if (staff) {
//       incident.assignedTo = staff._id;
//       await incident.save();

//       // 📧 STAFF EMAIL (NOW SAFE)
//       await sendEmail(
//         staff.email,
//         "New Ticket Assigned",
//         `Ticket ${incident.ticketId} has been assigned to you.`
//       );
//     }

//     // 📧 USER EMAIL
//     await sendEmail(
//       req.user.email,
//       "Ticket Created",
//       `Your ticket ${incident.ticketId} has been created successfully.`
//     );

//     // 📧 ADMIN EMAIL
//     const admins = await User.find({ role: "admin" });
//     for (let admin of admins) {
//       await sendEmail(
//         admin.email,
//         "New Ticket Created",
//         `A new ticket ${incident.ticketId} has been created.`
//       );
//     }

//     // 🔔 NOTIFICATIONS
//     await Notification.create({
//       user: req.user._id,
//       role: "user",
//       message: `Your ticket ${incident.ticketId} has been created`,
//     });

//     await Notification.create({
//       role: "admin",
//       message: `New ticket ${incident.ticketId} created`,
//     });

//     await Notification.create({
//       role: "staff",
//       message: `New ticket assigned to ${department} department`,
//     });

//     res.status(201).json(incident);
//   } catch (err) {
//     console.error("CREATE INCIDENT ERROR:", err);
//     res.status(500).json({ message: "Ticket creation failed" });
//   }
// };

// // export const createIncident = async (req, res) => {
// //   try {
// //     const { title, description, category } = req.body;

// //     if (!title || !description) {
// //       return res.status(400).json({ message: "Title and description required" });
// //     }

// //     // ✅ safer ticketId (no collision)
// //     const ticketId = `INC-${new Date().getFullYear()}-${String(new mongoose.Types.ObjectId()).slice(-6).toUpperCase()}`;

// //     let department = "General";
// //     let priority = "Low";

// //     // 🤖 LLM classify (optional)
// //     try {
// //       const llmResult = await classifyIncident(title, description);
// //       department = normalizeDepartment(llmResult?.department);
// //       priority = normalizePriority(llmResult?.priority);
// //     } catch (e) {
// //       console.log("LLM skipped:", e?.message);
// //     }

// //     // 🎫 Create incident first
// //     const incident = await Incident.create({
// //       ticketId,
// //       title,
// //       description,
// //       category: category || "General",
// //       priority,
// //       department,
// //       createdBy: req.user._id,
// //       attachment: req.file?.filename || null,
// //       status: INCIDENT_STATUS.OPEN,
// //       llmMeta: {
// //         originalDepartment: department,
// //         updatedByAdmin: false,
// //       },
// //     });

// //     // ✅ Auto-assign: Skill + Workload
// //     let assignedTo = await pickBestStaff({ department, category });

// //     // fallback: any staff
// //     if (!assignedTo) {
// //       const fallback = await User.findOne({ role: "staff", isActive: true }).select("_id");
// //       assignedTo = fallback?._id || null;
// //     }

// //     // save assignment (if found)
// //     let staff = null;
// //     if (assignedTo) {
// //       incident.assignedTo = assignedTo;
// //       await incident.save();

// //       staff = await User.findById(assignedTo).select("email full_name");

// //       // staff email
// //       if (staff?.email) {
// //         await sendEmail(
// //           staff.email,
// //           "New Ticket Assigned",
// //           `Ticket ${incident.ticketId} has been assigned to you.`
// //         );
// //       }

// //       // staff notification (personal)
// //       await Notification.create({
// //         user: assignedTo,
// //         message: `🧾 New ticket assigned: ${incident.ticketId} (${incident.department})`,
// //       });
// //     }

// //     // user email
// //     await sendEmail(
// //       req.user.email,
// //       "Ticket Created",
// //       `Your ticket ${incident.ticketId} has been created successfully.`
// //     );

// //     // user notification
// //     await Notification.create({
// //       user: req.user._id,
// //       message: `✅ Your ticket ${incident.ticketId} has been created`,
// //     });

// //     // admin role broadcast notification
// //     await Notification.create({
// //       role: "admin",
// //       message: `🆕 New ticket ${incident.ticketId} created${staff ? ` and assigned to ${staff.full_name}` : ""}.`,
// //     });

// //     return res.status(201).json(incident);
// //   } catch (err) {
// //     console.error("CREATE INCIDENT ERROR:", err);
// //     return res.status(500).json({ message: "Ticket creation failed" });
// //   }
// // };

// /* ===============================
//    GET INCIDENT BY ID saud al-juma
  
// ================================ */

// export const getIncidentById = async (req, res) => {
//   try {
// const incident = await Incident.findById(req.params.id)
//   .populate({
//     path: "comments.user",
//     select: "full_name email", // optional
//   })
//   .populate("createdBy", "full_name email")
//   .populate("assignedTo", "full_name email department");  
//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     res.json(incident);
//   } catch (error) {
//     console.error("GET INCIDENT ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    ADD COMMENT
// ================================ */
// export const addComment = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message) {
//       return res.status(400).json({ message: "Comment message required" });
//     }

//     const incident = await Incident.findById(req.params.id);
//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     incident.comments.push({
//       message,
//       user: req.user._id,
//       role: req.user.role,
//       createdAt: new Date(),
//     });

//     // 🔥 AUTO STATUS UPDATE
//     if (
//       req.user.role === "staff" &&
//       incident.status === INCIDENT_STATUS.OPEN
//     ) {
//       incident.status = INCIDENT_STATUS.IN_PROGRESS;
//     }

//     await incident.save();

//     res.json({
//       message: "Comment added",
//       status: incident.status,
//       comments: incident.comments,
//     });
//   } catch (error) {
//     console.error("ADD COMMENT ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getMyIncidents = async (req, res) => {
//   try {
//     const incidents = await Incident.find({
//       createdBy: req.user._id,
//     })
//       .sort({ createdAt: -1 })
//       .select(
//         "ticketId title status priority category createdAt"
//       );

//     res.json(incidents);
//   } catch (error) {
//     console.error("GET MY INCIDENTS ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateIncidentStatus = async (req, res) => {
//   try {
//     if (!["staff", "admin"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     const { status: newStatus } = req.body;
//     const incident = await Incident.findById(req.params.id);

//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     const currentStatus = incident.status;

//     // ✅ ADMIN CAN OVERRIDE ANY STATUS
//     if (req.user.role !== "admin") {
//       const allowedNext = allowedTransitions[currentStatus] || [];

//       if (!allowedNext.includes(newStatus)) {
//         return res.status(400).json({
//           message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
//         });
//       }
//     }

//     incident.status = newStatus;
//     await incident.save();

//     // 🔔 Notify user when resolved
//     if (newStatus === INCIDENT_STATUS.RESOLVED) {
//       await Notification.create({
//         user: incident.createdBy,
//         role: "user",
//         message: `Your ticket ${incident.ticketId} has been resolved`,
//       });
//     }

//     res.json({
//       message: "Status updated successfully",
//       incident,
//     });
//   } catch (err) {
//     console.error("UPDATE STATUS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// export const markResolved = async (req, res) => {
//   try {
//     const incident = await Incident.findById(req.params.id);

//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     if(incident.status === INCIDENT_STATUS.CLOSED){
//       return res.status(400).json({
//         message: "Closed tickets cannot be modified"
//       });
//     }

//     incident.status = INCIDENT_STATUS.RESOLVED;
//     await incident.save();

//     const io = req.app.get("io");
//     io.to(incident.createdBy.toString()).emit("ticket_resolved", incident);

//     res.json({ message: "Ticket marked as resolved" });

//   } catch (err) {
//     console.error("RESOLVE ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateDepartment = async (req, res) => {
//   try {
//     const { department } = req.body;

//     const incident = await Incident.findById(req.params.id);
//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     // 🧠 Save LLM metadata ONLY once
//     if (!incident.llmMeta) {
//       incident.llmMeta = {
//         originalDepartment: incident.department,
//         updatedByAdmin: false,
//       };
//     }

//     // 🛠 Admin override
//     incident.department = department;
//     incident.llmMeta.updatedByAdmin = true;

//     // Optional: unassign wrong staff
//     incident.assignedTo = null;

//     await AuditLog.create({
//       incidentId: incident._id,
//       originalDepartment: incident.llmMeta.originalDepartment,
//       updateDepartment: department,
//       updatedAt: req.user._id
//     })

//     await incident.save();

//     // 🔔 Notify staff & admin
//     const io = req.app.get("io");
//     io.to("admin").emit("ticket_department_updated", incident);
//     io.to(department).emit("ticket_assigned", incident);

//     res.json({
//       message: "Department overridden by admin",
//       incident,
//     });
//   } catch (err) {
//     console.error("UPDATE DEPARTMENT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const downloadIncidentReport = async (req, res) => {
//   try {
//     const incident = await Incident.findById(req.params.id)
//       .populate("createdBy", "full_name email")
//       .populate("assignedTo", "full_name email department");

//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     const doc = new PDFDocument({ margin: 50 });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       // 🧾 AUDIT LOG
//       await AuditLog.create({
//         incidentId: incident._id,
//         action: "REPORT_DOWNLOADED",
//         performedBy: req.user.id,
//         role: req.user.role,
//       });

//       // 📧 EMAIL WITH PDF
//       await sendEmailWithAttachment({
//         to: incident.createdBy.email,
//         subject: `Ticket Report - ${incident.ticketId}`,
//         text: `Please find attached the report for ticket ${incident.ticketId}.`,
//         filename: `${incident.ticketId}.pdf`,
//         content: pdfBuffer,
//       });

//       // ⬇️ SEND TO BROWSER
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename=${incident.ticketId}.pdf`
//       );
//       res.send(pdfBuffer);
//     });

//     /* ======================
//        PIPE FIRST (IMPORTANT)
//     ====================== */
//     const bgPath = path.join("assets", "AIMS.jpg");
//     if (fs.existsSync(bgPath)) {
//       doc.opacity(0.1);
//       doc.image(bgPath, 0, 0, {
//         width: doc.page.width,
//         height: doc.page.height,
//       });
//       doc.opacity(1);
//     }

//     /* ======================
//        REPORT CONTENT
//     ====================== */
//     doc.fontSize(18).text("Incident Report", {
//       align: "center",
//       underline: true,
//     });

//     doc.moveDown(2);

//     doc.fontSize(12);
//     doc.text(`Ticket ID: ${incident.ticketId}`);
//     doc.text(`Title: ${incident.title}`);
//     doc.text(`Status: ${incident.status}`);
//     doc.text(`Priority: ${incident.priority}`);
//     doc.text(`Department: ${incident.department}`);

//     doc.moveDown();
//     doc.text(
//       `Created By: ${incident.createdBy.full_name} (${incident.createdBy.email})`
//     );
//     doc.text(
//       `Assigned To: ${
//         incident.assignedTo
//           ? `${incident.assignedTo.full_name} (${incident.assignedTo.email})`
//           : "Unassigned"
//       }`
//     );

//     doc.moveDown();
//     doc.text("Description:", { underline: true });
//     doc.text(incident.description);

//     doc.moveDown();
//     doc.text("Comments:", { underline: true });
//     incident.comments.forEach((c) => {
//       doc.text(`• [${c.role}] ${c.message}`);
//     });

//     doc.end();
//   } catch (err) {
//     console.error("DOWNLOAD REPORT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // router.get("/:id/report", protect, async (req, res) => {
// //   const ticket = await Incident.findById(req.params.id);

// //   if (!ticket) {
// //     return res.status(404).json({ message: "Ticket not found" });
// //   }

// //   // Generate PDF or text
// //   res.setHeader("Content-Type", "application/pdf");
// //   res.setHeader("Content-Disposition", "attachment; filename=ticket.pdf");

// //   res.send(pdfBuffer);
// // });
// export const getAssignedTickets = async (req, res) => {
//   try {
//     const staffId = req.user.id;
//     const tickets = await Incident.find({ assignedTo: staffId });

//     res.json({ tickets });
//   }
//   catch (err) {
//     console.error("GET ASSIGNED TICKETS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// 2nd attempt after some refactor and fixes. This file is getting too big, consider splitting into multiple controllers in the future (e.g. incidentController, reportController, slaController, etc.)
// import crypto from "crypto";
// import Incident from "../models/incident.js";
// import User from "../models/User.js";
// import Notification from "../models/notification.js";
// import { classifyIncident } from "../llmService.js";
// import PDFDocument from "pdfkit";
// import AuditLog from "../models/AuditLog.js";
// import { sendEmailWithAttachment } from "../utils/sendEmailStaff.js";
// import fs from "fs";
// import path from "path";
// import sendEmail from "../utils/sendEmail.js";
// import mongoose from "mongoose";
// import KnowledgeBase from "../models/knowledgeBase.js";
// import SlaRule from "../models/SlaRule.js";
// /* ===============================
//    HELPERS
// ================================ */
// const VALID_DEPARTMENTS = ["Network", "Hardware", "Software", "Security", "General"];
// const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];

// const extractKeywords = (text = "") => {
//   return text
//     .toLowerCase()
//     .split(/\W+/)
//     .filter((w) => w.length > 3);
// };
// const normalizeDepartment = (dept) => {
//   if (!dept) return "General";
//   const normalized = String(dept).trim().toLowerCase();
//   return VALID_DEPARTMENTS.find((d) => d.toLowerCase() === normalized) || "General";
// };

// const normalizePriority = (priority) => {
//   if (!priority) return "Low";
//   const normalized = String(priority).trim().toLowerCase();
//   return VALID_PRIORITIES.find((p) => p.toLowerCase() === normalized) || "Low";
// };
// const normalizeText = (s = "") =>
//   s
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .replace(/[^\w\s]/g, "")
//     .trim();

// const buildNormalizedText = ({ title = "", description = "", category = "" }) => {
//   return normalizeText(`${title} ${category} ${description}`);
// };

// const buildFingerprint = (normalizedText) => {
//   return crypto.createHash("sha256").update(normalizedText).digest("hex");
// };

// // Skill + Workload based pick
// const pickBestStaff = async ({ department, category }) => {
//   const staffList = await User.find({
//     role: "staff",
//     isActive: true,
//     department,
//   }).select("_id skills department");

//   if (!staffList.length) return null;

//   const staffIds = staffList.map((s) => s._id);

//   const loads = await Incident.aggregate([
//     {
//       $match: {
//         assignedTo: { $in: staffIds },
//         status: { $in: ["Open", "Pending", "In Progress"] },
//       },
//     },
//     { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
//   ]);

//   const loadMap = new Map(loads.map((x) => [String(x._id), x.count]));
//   const cat = String(category || "").toLowerCase();

//   let best = null;
//   let bestScore = -1e9;

//   for (const s of staffList) {
//     const workload = loadMap.get(String(s._id)) || 0;
//     const skillMatch = (s.skills || []).some((sk) =>
//       cat.includes(String(sk).toLowerCase())
//     )
//       ? 1
//       : 0;

//     const score = (skillMatch * 1000) - workload;

//     if (score > bestScore) {
//       bestScore = score;
//       best = s;
//     }
//   }

//   return best?._id || null;
// };

// /* ===============================
//    CONSTANTS
// ================================ */
// export const INCIDENT_STATUS = {
//   OPEN: "Open",
//   PENDING: "Pending",
//   RESOLVED: "Resolved",
//   CLOSED: "Closed",
//   IN_PROGRESS: "In Progress",
// };

// const allowedTransitions = {
//   Open: ["In Progress"],
//   "In Progress": ["Resolved"],
//   Resolved: ["Closed"],
// };

// /* ===============================
//    CREATE INCIDENT (LLM + AUTO ASSIGN)
// ================================ */
// export const createIncident = async (req, res) => {
//   try {
//     const { title, description, category } = req.body;

//     if (!title?.trim() || !description?.trim()) {
//       return res.status(400).json({ message: "Title and description required" });
//     }

//     // safer ticketId
//     const ticketId = `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

//     let department = "General";
//     let priority = "Low";

//     // LLM classify (safe)
//     try {
//       const llmResult = await classifyIncident(title, description);
//       department = normalizeDepartment(llmResult?.department);
//       priority = normalizePriority(llmResult?.priority);
//     } catch (e) {
//       console.log("LLM skipped:", e?.message);
//     }

//     const normalizedText = buildNormalizedText({ title, description, category });
//     const fingerprint = buildFingerprint(normalizedText);
//     const incident = await Incident.create({
//       ticketId,
//       title,
//       description,
//       category: category || "General",
//       priority,
//       department,
//       createdBy: req.user._id,
//       attachment: req.file?.filename || null,
//       status: INCIDENT_STATUS.OPEN,
//       normalizedText,
//       fingerprint,
//       llmMeta: {
//         originalDepartment: department,
//         updatedByAdmin: false,
//       },
//     });

//     // Auto assign staff (skill + workload)
//     let assignedTo = await pickBestStaff({ department, category });

//     if (!assignedTo) {
//       const fallback = await User.findOne({ role: "staff", isActive: true }).select("_id");
//       assignedTo = fallback?._id || null;
//     }

//     let staff = null;
//     if (assignedTo) {
//       incident.assignedTo = assignedTo;
//       await incident.save();
//       staff = await User.findById(assignedTo).select("email full_name _id department");
//     }

//     // ---- Notifications (safe)
//     try {
//       await Notification.create({
//         user: req.user._id,
//         type: "ticket_created",
//         message: `✅ Your ticket ${incident.ticketId} has been created`,
//       });
//     } catch (e) {
//       console.log("User notification failed:", e.message);
//     }

//     try {
//       await Notification.create({
//         role: "admin",
//         message: `🆕 New ticket ${incident.ticketId} created${staff ? ` (assigned to ${staff.full_name})` : ""}`,
//       });
//     } catch (e) {
//       console.log("Admin notification failed:", e.message);
//     }

//     if (staff?._id) {
//       try {
//         await Notification.create({
//           user: staff._id,
//           role: "staff",
//           message: `📌 Ticket ${incident.ticketId} assigned to you (${incident.department})`,
//         });
//       } catch (e) {
//         console.log("Staff notification failed:", e.message);
//       }
//     }

//     // ---- Emails (never break ticket creation)
//     try {
//       await sendEmail(req.user.email, "Ticket Created", `Your ticket ${incident.ticketId} has been created.`);
//     } catch (e) {
//       console.log("User email failed:", e.message);
//     }

//     if (staff?.email) {
//       try {
//         await sendEmail(staff.email, "New Ticket Assigned", `Ticket ${incident.ticketId} has been assigned to you.`);
//       } catch (e) {
//         console.log("Staff email failed:", e.message);
//       }
//     }

//     // You may skip admin emails (optional) if SMTP rate limits
//     // If you want it, keep it in try/catch
//     /*
//     try {
//       const admins = await User.find({ role: "admin" }).select("email");
//       for (const a of admins) {
//         await sendEmail(a.email, "New Ticket Created", `Ticket ${incident.ticketId} created.`);
//       }
//     } catch (e) {
//       console.log("Admin email failed:", e.message);
//     }
//     */

//     return res.status(201).json(incident);
//   } catch (err) {
//     console.error("CREATE INCIDENT ERROR:", err);
//     return res.status(500).json({ message: "Ticket creation failed", error: err.message });
//   }
// };

// /* ===============================
//    GET INCIDENT BY ID
// ================================ */
// export const getIncidentById = async (req, res) => {
//   try {
//     const incident = await Incident.findById(req.params.id)
//       .populate({ path: "comments.user", select: "full_name email" })
//       .populate("createdBy", "full_name email")
//       .populate("assignedTo", "full_name email department");

//     if (!incident) return res.status(404).json({ message: "Incident not found" });

//     res.json(incident);
//   } catch (error) {
//     console.error("GET INCIDENT ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    ADD COMMENT
// ================================ */
// export const addComment = async (req, res) => {
//   try {
//     const { message } = req.body;
//     if (!message?.trim()) return res.status(400).json({ message: "Comment message required" });

//     const incident = await Incident.findById(req.params.id);
//     if (!incident) return res.status(404).json({ message: "Incident not found" });

//     incident.comments.push({
//       message,
//       user: req.user._id,
//       role: req.user.role,
//       createdAt: new Date(),
//     });

//     if (req.user.role === "staff" && incident.status === INCIDENT_STATUS.OPEN) {
//       incident.status = INCIDENT_STATUS.IN_PROGRESS;
//     }

//     await incident.save();

//     res.json({ message: "Comment added", status: incident.status, comments: incident.comments });
//   } catch (error) {
//     console.error("ADD COMMENT ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    GET MY INCIDENTS
// ================================ */
// export const getMyIncidents = async (req, res) => {
//   try {
//     const incidents = await Incident.find({ createdBy: req.user._id })
//       .sort({ createdAt: -1 })
//       .select("ticketId title status priority category createdAt");

//     res.json(incidents);
//   } catch (error) {
//     console.error("GET MY INCIDENTS ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    UPDATE STATUS
// ================================ */
// export const updateIncidentStatus = async (req, res) => {
//   try {
//     if (!["staff", "admin"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     const { status: newStatus } = req.body;
//     const incident = await Incident.findById(req.params.id);
//     if (!incident) return res.status(404).json({ message: "Incident not found" });

//     const currentStatus = incident.status;

//     if (req.user.role !== "admin") {
//       const allowedNext = allowedTransitions[currentStatus] || [];
//       if (!allowedNext.includes(newStatus)) {
//         return res.status(400).json({
//           message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
//         });
//       }
//     }

//     incident.status = newStatus;
//     await incident.save();

//     if (newStatus === INCIDENT_STATUS.RESOLVED) {
//       try {
//         await Notification.create({
//           user: incident.createdBy,
//           role: "user",
//           message: `✅ Your ticket ${incident.ticketId} has been resolved`,
//         });
//       } catch {}
//     }

//     res.json({ message: "Status updated successfully", incident });
//   } catch (err) {
//     console.error("UPDATE STATUS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const predictSlaRisk = async (incident) => {
//   let score = 0;

//   if (incident.priority === "High") score += 30;
//   if (incident.priority === "Critical") score += 50;
//   if (!incident.assignedTo) score += 20;

//   const ageMin = (Date.now() - new Date(incident.createdAt).getTime()) / 60000;
//   if (ageMin > 30) score += 20;

//   const similarBreaches = await Incident.countDocuments({
//     department: incident.department,
//     title: { $regex: incident.title.split(" ")[0], $options: "i" },
//     slaBreached: true
//   });

//   if (similarBreaches > 3) score += 20;

//   return Math.min(score, 100);
// };

// export const getHeatmapStats = async (req, res) => { 
//   const data = await Incident.aggregate([
//     {
//       $project: {
//         department: 1,
//         hour: { $hour: "$createdAt" },
//         day: { $dayOfWeek: "$createdAt" }
//       }
//     },
//     {
//       $group: {
//         _id: { department: "$department", day: "$day", hour: "$hour" },
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   res.json(data);
// };

// export const getSolutionSuggestions = async (title, description, department) => {
//   const keywords = extractKeywords(`${title} ${description}`);

//   const articles = await KnowledgeBase.find({
//     department,
//     keywords: { $in: keywords },
//     isActive: true
//   }).limit(5);

//   return articles.map(a => ({
//     title: a.title,
//     steps: a.solutionSteps
//   }));
// };
// /* ===============================
//    MARK RESOLVED
// ================================ */
// export const markResolved = async (req, res) => {
//   try {
//     const incident = await Incident.findById(req.params.id);
//     if (!incident) return res.status(404).json({ message: "Incident not found" });

//     if (incident.status === INCIDENT_STATUS.CLOSED) {
//       return res.status(400).json({ message: "Closed tickets cannot be modified" });
//     }

//     incident.status = INCIDENT_STATUS.RESOLVED;
//     await incident.save();

//     const io = req.app.get("io");
//     io?.to(String(incident.createdBy)).emit("ticket_resolved", incident);

//     res.json({ message: "Ticket marked as resolved" });
//   } catch (err) {
//     console.error("RESOLVE ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    UPDATE DEPARTMENT
// ================================ */
// export const updateDepartment = async (req, res) => {
//   try {
//     const { department } = req.body;

//     const incident = await Incident.findById(req.params.id);
//     if (!incident) return res.status(404).json({ message: "Incident not found" });

//     if (!incident.llmMeta) {
//       incident.llmMeta = { originalDepartment: incident.department, updatedByAdmin: false };
//     }

//     incident.department = department;
//     incident.llmMeta.updatedByAdmin = true;
//     incident.assignedTo = null; // unassign wrong staff

//     await AuditLog.create({
//       incidentId: incident._id,
//       action: "DEPARTMENT_UPDATED",
//       performedBy: req.user._id,
//       role: req.user.role,
//       details: { from: incident.llmMeta.originalDepartment, to: department },
//     });

//     await incident.save();

//     const io = req.app.get("io");
//     io?.to("admin").emit("ticket_department_updated", incident);

//     res.json({ message: "Department overridden by admin", incident });
//   } catch (err) {
//     console.error("UPDATE DEPARTMENT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    DOWNLOAD REPORT
// ================================ */
// export const downloadIncidentReport = async (req, res) => {
//   try {
//     const incident = await Incident.findById(req.params.id)
//       .populate("createdBy", "full_name email")
//       .populate("assignedTo", "full_name email department");

//     if (!incident) return res.status(404).json({ message: "Incident not found" });

//     const doc = new PDFDocument({ margin: 50 });
//     const buffers = [];

//     doc.on("data", buffers.push.bind(buffers));

//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);

//       try {
//         await AuditLog.create({
//           incidentId: incident._id,
//           action: "REPORT_DOWNLOADED",
//           performedBy: req.user._id,
//           role: req.user.role,
//         });
//       } catch {}

//       try {
//         await sendEmailWithAttachment({
//           to: incident.createdBy.email,
//           subject: `Ticket Report - ${incident.ticketId}`,
//           text: `Report for ticket ${incident.ticketId}.`,
//           filename: `${incident.ticketId}.pdf`,
//           content: pdfBuffer,
//         });
//       } catch {}

//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader("Content-Disposition", `attachment; filename=${incident.ticketId}.pdf`);
//       res.send(pdfBuffer);
//     });

//     const bgPath = path.join("assets", "AIMS.jpg");
//     if (fs.existsSync(bgPath)) {
//       doc.opacity(0.1);
//       doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });
//       doc.opacity(1);
//     }

//     doc.fontSize(18).text("Incident Report", { align: "center", underline: true });
//     doc.moveDown(2);

//     doc.fontSize(12);
//     doc.text(`Ticket ID: ${incident.ticketId}`);
//     doc.text(`Title: ${incident.title}`);
//     doc.text(`Status: ${incident.status}`);
//     doc.text(`Priority: ${incident.priority}`);
//     doc.text(`Department: ${incident.department}`);

//     doc.moveDown();
//     doc.text(`Created By: ${incident.createdBy.full_name} (${incident.createdBy.email})`);
//     doc.text(
//       `Assigned To: ${
//         incident.assignedTo
//           ? `${incident.assignedTo.full_name} (${incident.assignedTo.email})`
//           : "Unassigned"
//       }`
//     );

//     doc.moveDown();
//     doc.text("Description:", { underline: true });
//     doc.text(incident.description);

//     doc.moveDown();
//     doc.text("Comments:", { underline: true });
//     (incident.comments || []).forEach((c) => doc.text(`• [${c.role}] ${c.message}`));

//     doc.end();
//   } catch (err) {
//     console.error("DOWNLOAD REPORT ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* ===============================
//    ASSIGNED TICKETS (STAFF)
// ================================ */
// export const getAssignedTickets = async (req, res) => {
//   try {
//     const staffId = req.user._id;
//     const tickets = await Incident.find({ assignedTo: staffId }).sort({ createdAt: -1 });
//     res.json({ tickets });
//   } catch (err) {
//     console.error("GET ASSIGNED TICKETS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

import crypto from "crypto";
import Incident from "../models/incident.js";
import User from "../models/User.js";
import Notification from "../models/notification.js";
import { classifyIncident } from "../llmService.js";
import PDFDocument from "pdfkit";
import AuditLog from "../models/AuditLog.js";
import { sendEmailWithAttachment } from "../utils/sendEmailStaff.js";
import fs from "fs";
import path from "path";
import sendEmail from "../utils/sendEmail.js";
import KnowledgeBase from "../models/knowledgeBase.js";
import { askLLM } from "../llmService.js";
import Feedback from "../models/feedback.js";
// import AuditLogModel from "../models/AuditLog.js";
/* ===============================
   HELPERS
================================ */
const VALID_DEPARTMENTS = ["IT", "Network", "Hardware", "Accounts", "General"];
const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];

const extractKeywords = (text = "") => {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
};

const normalizeDepartment = (dept) => {
  if (!dept) return "General";

  const value = String(dept).trim().toLowerCase();

  if (
    value === "software" ||
    value === "security" ||
    value === "it" ||
    value === "authentication" ||
    value === "login"
  ) return "IT";

  if (value === "network") return "Network";
  if (value === "hardware") return "Hardware";
  if (value === "account" || value === "accounts") return "Accounts";

  return "General";
};

const normalizePriority = (priority) => {
  if (!priority) return "Low";
  const normalized = String(priority).trim().toLowerCase();
  return VALID_PRIORITIES.find((p) => p.toLowerCase() === normalized) || "Low";
};

const normalizeText = (s = "") =>
  s.toLowerCase().replace(/\s+/g, " ").replace(/[^\w\s]/g, "").trim();

const buildNormalizedText = ({ title = "", description = "", category = "" }) => {
  return normalizeText(`${title} ${category} ${description}`);
};

const buildFingerprint = (normalizedText) => {
  return crypto.createHash("sha256").update(normalizedText).digest("hex");
};

const pickBestStaff = async ({ department, category }) => {
  let staffList = await User.find({
    role: "staff",
    isActive: true,
    department,
  }).select("_id skills department");

  if (!staffList.length) {
    staffList = await User.find({
      role: "staff",
      isActive: true,
    }).select("_id skills department");
  }

  if (!staffList.length) return null;

  const staffIds = staffList.map((s) => s._id);

  const loads = await Incident.aggregate([
    {
      $match: {
        assignedTo: { $in: staffIds },
        status: { $in: ["Open", "Pending", "In Progress"] },
      },
    },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
  ]);

  const loadMap = new Map(loads.map((x) => [String(x._id), x.count]));
  const cat = String(category || "").toLowerCase();

  let best = null;
  let bestScore = -1e9;

  for (const s of staffList) {
    const workload = loadMap.get(String(s._id)) || 0;

    const skillMatch = (s.skills || []).some((sk) =>
      cat.includes(String(sk).toLowerCase())
    )
      ? 1
      : 0;

    const score = skillMatch * 1000 - workload;

    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }

  return best?._id || null;
};

const calculateSlaRisk = async (incident) => {
  let score = 0;

  if (incident.priority === "High") score += 30;
  if (incident.priority === "Critical") score += 50;
  if (!incident.assignedTo) score += 20;

  const ageMin = (Date.now() - new Date(incident.createdAt).getTime()) / 60000;
  if (ageMin > 30) score += 20;

  const firstWord = incident.title?.split(" ")[0] || "";
  const similarBreaches = await Incident.countDocuments({
    department: incident.department,
    title: { $regex: firstWord, $options: "i" },
    slaBreached: true,
  });

  if (similarBreaches > 3) score += 20;

  return Math.min(score, 100);
};

/* ===============================
   CONSTANTS
================================ */
export const INCIDENT_STATUS = {
  OPEN: "Open",
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  IN_PROGRESS: "In Progress",
  REOPENED: "Reopened",
};

const allowedTransitions = {
  Open: ["In Progress"],
  "In Progress": ["Resolved"],
  Reopened: ["In Progress"],
};

/* ===============================
   CREATE INCIDENT
================================ */
export const createIncident = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const ticketId = `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    let department = "General";
    let priority = "Low";

    try {
      const llmResult = await classifyIncident(title, description);
      department = normalizeDepartment(llmResult?.department);
      priority = normalizePriority(llmResult?.priority);
    } catch (e) {
      console.log("LLM skipped:", e?.message);
    }

    const normalizedText = buildNormalizedText({ title, description, category });
    const fingerprint = buildFingerprint(normalizedText);

    const incident = await Incident.create({
      ticketId,
      title,
      description,
      category: category || "General",
      priority,
      department,
      createdBy: req.user._id,
      attachment: req.file?.filename || null,
      status: INCIDENT_STATUS.OPEN,
      normalizedText,
      fingerprint,
      llmMeta: {
        originalDepartment: department,
        updatedByAdmin: false,
      },
    });

    let assignedTo = await pickBestStaff({ department, category });

    if (!assignedTo) {
      const fallback = await User.findOne({ role: "staff", isActive: true }).select("_id");
      assignedTo = fallback?._id || null;
    }

    let staff = null;
    if (assignedTo) {
      incident.assignedTo = assignedTo;
      await incident.save();
      staff = await User.findById(assignedTo).select("email full_name _id department");
    }
  await AuditLog.create({
    action: "TICKET_ASSIGNED",
    incidentId: incident._id,
    updatedBy: req.user?._id || null,
    details: {
      ticketId: incident.ticketId,
      assignedTo: staff?._id || assignedTo,
      assignedToName: staff?.full_name || "",
      department: incident.department,
    },
  });
    try {
      await Notification.create({
        user: req.user._id,
        type: "ticket_created",
        role: "user",
        message: `✅ Your ticket ${incident.ticketId} has been created`,
      });
    } catch (e) {
      console.log("User notification failed:", e.message);
    }

    try {
      await Notification.create({
        role: "admin",
        message: `🆕 New ticket ${incident.ticketId} created${staff ? ` (assigned to ${staff.full_name})` : ""}`,
      });
    } catch (e) {
      console.log("Admin notification failed:", e.message);
    }

    if (staff?._id) {
      try {
        await Notification.create({
          user: staff._id,
          role: "staff",
          message: `📌 Ticket ${incident.ticketId} assigned to you (${incident.department})`,
        });
      } catch (e) {
        console.log("Staff notification failed:", e.message);
      }
    }

    try {
      await sendEmail(
        req.user.email,
        "Ticket Created",
        `Your ticket ${incident.ticketId} has been created.`
      );
    } catch (e) {
      console.log("User email failed:", e.message);
    }

    if (staff?.email) {
      try {
        await sendEmail(
          staff.email,
          "New Ticket Assigned",
          `Ticket ${incident.ticketId} has been assigned to you.`
        );
      } catch (e) {
        console.log("Staff email failed:", e.message);
      }
    }

    return res.status(201).json(incident);
  } catch (err) {
    console.error("CREATE INCIDENT ERROR:", err);
    return res.status(500).json({
      message: "Ticket creation failed",
      error: err.message,
    });
  }
};

/* ===============================
   GET INCIDENT BY ID
================================ */
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate({ path: "comments.user", select: "full_name email" })
      .populate("createdBy", "full_name email")
      .populate("assignedTo", "full_name email department");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    res.json(incident);
  } catch (error) {
    console.error("GET INCIDENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ADD COMMENT
================================ */
export const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Comment message required" });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    incident.comments.push({
      message,
      user: req.user._id,
      role: req.user.role,
      createdAt: new Date(),
    });

    if (req.user.role === "staff" && incident.status === INCIDENT_STATUS.OPEN) {
      incident.status = INCIDENT_STATUS.IN_PROGRESS;
    }

    await incident.save();

    res.json({
      message: "Comment added",
      status: incident.status,
      comments: incident.comments,
    });
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   GET MY INCIDENTS
================================ */
export const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .select("ticketId title status priority category createdAt");

    res.json(incidents);
  } catch (error) {
    console.error("GET MY INCIDENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   UPDATE STATUS
================================ */
export const updateIncidentStatus = async (req, res) => {
  try {
    if (!["staff", "admin", "super_admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status: newStatus } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const currentStatus = incident.status;

    if (req.user.role === "staff") {
      const allowedNext = allowedTransitions[currentStatus] || [];

      if (!allowedNext.includes(newStatus)) {
        return res.status(400).json({
          message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        });
      }

      if (newStatus === "Closed") {
        return res.status(403).json({
          message: "Staff cannot close incidents. Admin approval required.",
        });
      }
    }

    if ((req.user.role === "admin" || req.user.role === "super_admin") && newStatus === "Closed") {
      return res.status(400).json({
        message: "Use approve-close endpoint to close a resolved incident.",
      });
    }

    incident.status = newStatus;

    if (newStatus === "Resolved") {
      incident.resolvedAt = new Date();
    }

    await incident.save();

    if (newStatus === "Resolved") {
      await Notification.create({
        user: incident.createdBy,
        role: "user",
        message: `✅ Your ticket ${incident.ticketId} has been resolved`,
      });
    }

    await AuditLog.create({
      action: "STATUS_UPDATED",
      incidentId: incident._id,
      updatedBy: req.user._id,
      details: {
        ticketId: incident.ticketId,
        previousStatus: currentStatus,
        newStatus,
        updatedByRole: req.user.role,
      },
    });

    res.json({
      message: "Status updated successfully",
      incident,
    });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveCloseIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.status !== "Resolved") {
      return res.status(400).json({
        message: "Only resolved incidents can be approved for close",
      });
    }

    const previousStatus = incident.status;

    incident.status = "Closed";
    incident.closedAt = new Date();
    await incident.save();

    await AuditLog.create({
      action: "TICKET_CLOSED",
      incidentId: incident._id,
      updatedBy: req.user._id,
      details: {
        ticketId: incident.ticketId,
        previousStatus,
        newStatus: "Closed",
        approvedByRole: req.user.role,
      },
    });

    return res.json({
      message: "Incident close approved",
      incident,
    });
  } catch (err) {
    console.error("APPROVE CLOSE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rejectCloseIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.status !== "Resolved") {
      return res.status(400).json({
        message: "Only resolved incidents can be rejected",
      });
    }

    const previousStatus = incident.status;

    incident.status = "In Progress";
    await incident.save();

    await AuditLog.create({
      action: "TICKET_CLOSE_REJECTED",
      incidentId: incident._id,
      updatedBy: req.user._id,
      details: {
        ticketId: incident.ticketId,
        previousStatus,
        newStatus: "In Progress",
        rejectedByRole: req.user.role,
      },
    });

    return res.json({
      message: "Close request rejected",
      incident,
    });
  } catch (err) {
    console.error("REJECT CLOSE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const reopenTicket = async (req, res) => {
  try {

    const incident = await Incident.findById(req.params.id);
    const { reason } = req.body;
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.status !== INCIDENT_STATUS.RESOLVED) {
      return res.status(400).json({
        message: "Only resolved tickets can be reopened"
      });
    }

    incident.status = INCIDENT_STATUS.REOPENED;
    incident.reopenedAt = new Date();
    incident.reopenReason = reason;
    await incident.save();
    await AuditLog.create({
  action: "TICKET_REOPENED",
  incidentId: incident._id,
  updatedBy: req.user._id,
  details: {
    ticketId: incident.ticketId,
    previousStatus: "Resolved",
    newStatus: "Reopened",
    reopenReason: reason || "",
  },
});
    // 🔔 Notify staff
    await Notification.create({
      user: incident.assignedTo,
      role: "staff",
      message: `Ticket ${incident.ticketId} has been reopened by the user`
    });

    res.json({
      message: "Ticket reopened successfully",
      incident
    });

  } catch (err) {
    console.error("REOPEN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   PREDICT SLA RISK (ROUTE CONTROLLER)
================================ */
export const predictSlaRisk = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Incident id is required" });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const riskScore = await calculateSlaRisk(incident);

    res.json({
      incidentId: incident._id,
      ticketId: incident.ticketId,
      riskScore,
    });
  } catch (err) {
    console.error("PREDICT SLA RISK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   HEATMAP STATS
================================ */
export const getHeatmapStats = async (req, res) => {
  try {
    const data = await Incident.aggregate([
      {
        $project: {
          department: 1,
          hour: { $hour: "$createdAt" },
          day: { $dayOfWeek: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            department: "$department",
            day: "$day",
            hour: "$hour",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.department": 1, "_id.day": 1, "_id.hour": 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("HEATMAP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   KNOWLEDGE BASE SUGGESTIONS
================================ */
export const getSolutionSuggestions = async (req, res) => {
  try {
    const { title, description, department } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const keywords = extractKeywords(`${title} ${description}`);

    /* ---------------- Knowledge Base Search ---------------- */
    const articles = await KnowledgeBase.find({
      department: department || "General",
      keywords: { $in: keywords },
      isActive: true,
    }).limit(5);

    if (articles.length > 0) {
      const suggestions = articles.map((a) => ({
        title: a.title,
        steps: a.solutionSteps,
      }));

      return res.json({ suggestions });
    }

    /* ---------------- LLM FALLBACK ---------------- */

    const prompt = `
User reported an IT incident.

Title: ${title}
Description: ${description}
Department: ${department}

Suggest troubleshooting steps to resolve the issue.
Return response in JSON format like this:

[
  {
    "title": "Possible Fix",
    "steps": ["Step 1", "Step 2", "Step 3"]
  }
]
`;

    const llmResponse = await askLLM(prompt);

    let suggestions = [];

    try {
      suggestions = JSON.parse(llmResponse);
    } catch {
      suggestions = [
        {
          title: "AI Suggested Troubleshooting",
          steps: [llmResponse],
        },
      ];
    }

    return res.json({ suggestions });

  } catch (err) {
    console.error("Solution suggestion error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const submitFeedback = async (req, res) => {
//   try {
//     const { incidentId, rating, comment } = req.body;

//     const feedback = await Feedback.create({
//       incidentId,
//       user: req.user._id,
//       rating,
//       comment
//     });

//     res.json({
//       message: "Feedback submitted",
//       feedback
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getRootCause = async (req, res) => {
  try {
    const { title, description } = req.body;

    const prompt = `
You are an IT expert.

Incident:
Title: ${title}
Description: ${description}

Explain the possible root cause in 2 lines.
`;

    const result = await askLLM(prompt);

    res.json({
      rootCause: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Root cause analysis failed" });
  }
};
/* ===============================
   MARK RESOLVED
================================ */
export const markResolved = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.status === INCIDENT_STATUS.CLOSED) {
      return res.status(400).json({
        message: "Closed tickets cannot be modified",
      });
    }

    const previousStatus = incident.status;

    incident.status = INCIDENT_STATUS.RESOLVED;
    incident.resolvedAt = new Date();
    await incident.save();

    const io = req.app.get("io");
    io?.to(String(incident.createdBy)).emit("ticket_resolved", incident);

    await AuditLog.create({
      action: "TICKET_RESOLVED",
      incidentId: incident._id,
      updatedBy: req.user._id,
      details: {
        ticketId: incident.ticketId,
        resolvedByRole: req.user.role,
        previousStatus,
        newStatus: incident.status,
      },
    });

    res.json({ message: "Ticket marked as resolved" });
  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   UPDATE DEPARTMENT
================================ */
export const updateDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    if (!VALID_DEPARTMENTS.includes(department)) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (!incident.llmMeta) {
      incident.llmMeta = {
        originalDepartment: incident.department,
        updatedByAdmin: false,
      };
    }

    incident.department = department;
    incident.llmMeta.updatedByAdmin = true;
    incident.assignedTo = null;

await AuditLog.create({
  action: "DEPARTMENT_UPDATED",
  incidentId: incident._id,
  updatedBy: req.user._id,
  originalDepartment: incident.llmMeta.originalDepartment,
  updatedDepartment: department,
  details: {
    ticketId: incident.ticketId,
  },
});

    await incident.save();

    const io = req.app.get("io");
    io?.to("admin").emit("ticket_department_updated", incident);

    res.json({
      message: "Department overridden by admin",
      incident,
    });
  } catch (err) {
    console.error("UPDATE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   DOWNLOAD REPORT
================================ */
export const downloadIncidentReport = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate("createdBy", "full_name email")
      .populate("assignedTo", "full_name email department");

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      try {
        await AuditLog.create({
          incidentId: incident._id,
          action: "REPORT_DOWNLOADED",
          performedBy: req.user._id,
          role: req.user.role,
        });
      } catch (e) {
        console.log("Audit log failed:", e.message);
      }

      try {
        await sendEmailWithAttachment({
          to: incident.createdBy.email,
          subject: `Ticket Report - ${incident.ticketId}`,
          text: `Report for ticket ${incident.ticketId}.`,
          filename: `${incident.ticketId}.pdf`,
          content: pdfBuffer,
        });
      } catch (e) {
        console.log("Email with attachment failed:", e.message);
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${incident.ticketId}.pdf`
      );
      res.send(pdfBuffer);
    });

    const bgPath = path.join("assets", "AIMS.jpg");
    if (fs.existsSync(bgPath)) {
      doc.opacity(0.1);
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.opacity(1);
    }

    doc.fontSize(18).text("Incident Report", {
      align: "center",
      underline: true,
    });

    doc.moveDown(2);
    doc.fontSize(12);
    doc.text(`Ticket ID: ${incident.ticketId}`);
    doc.text(`Title: ${incident.title}`);
    doc.text(`Status: ${incident.status}`);
    doc.text(`Priority: ${incident.priority}`);
    doc.text(`Department: ${incident.department}`);

    doc.moveDown();
    doc.text(
      `Created By: ${incident.createdBy.full_name} (${incident.createdBy.email})`
    );
    doc.text(
      `Assigned To: ${
        incident.assignedTo
          ? `${incident.assignedTo.full_name} (${incident.assignedTo.email})`
          : "Unassigned"
      }`
    );

    doc.moveDown();
    doc.text("Description:", { underline: true });
    doc.text(incident.description);

    doc.moveDown();
    doc.text("Comments:", { underline: true });

    (incident.comments || []).forEach((c) => {
      doc.text(`• [${c.role || "unknown"}] ${c.message}`);
    });

    doc.end();
  } catch (err) {
    console.error("DOWNLOAD REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ASSIGNED TICKETS
================================ */
export const getAssignedTickets = async (req, res) => {
  try {
    const staffId = req.user._id;
    const tickets = await Incident.find({ assignedTo: staffId }).sort({
      createdAt: -1,
    });

    res.json({ tickets });
  } catch (err) {
    console.error("GET ASSIGNED TICKETS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};