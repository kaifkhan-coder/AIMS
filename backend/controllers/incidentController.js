import Incident from "../models/incident.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import axios from "axios";
import Notification from "../models/notification.js";
import { getDepartmentByCategory } from "../utils/departmentMapper.js";
import { classifyIncident } from "../llmService.js";
import PDFDocument from "pdfkit";
import AuditLog from "../models/AuditLog.js";
import { sendEmailWithAttachment } from "../utils/sendEmailStaff.js";
import fs from "fs";
import path from "path";
import  sendEmail  from "../utils/sendEmail.js";
/* ===============================
   CREATE INCIDENT (LLM BASED)
================================ */
const VALID_DEPARTMENTS = [
  "Network",
  "Hardware",
  "Software",
  "Security",
  "General"
];
export const INCIDENT_STATUS = {
  OPEN: "Open",
  PENDING: "Pending",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  IN_PROGRESS : "In Progress"
};
const allowedTransitions = {
  Open: ["In Progress"],
  "In Progress": ["Resolved"],
  Resolved: ["Closed"],
};

export const createIncident = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const year = new Date().getFullYear();
    const count = await Incident.countDocuments();
    const ticketId = `INC-${year}-${count + 1}`;

    let department = "General";
    let priority = "Low";

    // 🤖 LLM (optional)
    try {
      const llmResult = await classifyIncident(title, description);
      if (llmResult?.department) department = llmResult.department;
      if (llmResult?.priority) priority = llmResult.priority;
    } catch {
      console.log("LLM skipped");
    }

    // 🎫 CREATE INCIDENT
    const incident = await Incident.create({
      ticketId,
      title,
      description,
      category: category || "General",
      priority,
      department,
      createdBy: req.user._id, // ✅ IMPORTANT
      attachment: req.file?.filename || null,
      status: INCIDENT_STATUS.OPEN,
      llmMeta: {
        originalDepartment: department,
        updatedByAdmin: false,
      },
    });

    // 👨‍💼 AUTO ASSIGN STAFF
    let staff = await User.findOne({ role: "staff", department });
    if (!staff) staff = await User.findOne({ role: "staff" });

    if (staff) {
      incident.assignedTo = staff._id;
      await incident.save();

      // 📧 STAFF EMAIL (NOW SAFE)
      await sendEmail(
        staff.email,
        "New Ticket Assigned",
        `Ticket ${incident.ticketId} has been assigned to you.`
      );
    }

    // 📧 USER EMAIL
    await sendEmail(
      req.user.email,
      "Ticket Created",
      `Your ticket ${incident.ticketId} has been created successfully.`
    );

    // 📧 ADMIN EMAIL
    const admins = await User.find({ role: "admin" });
    for (let admin of admins) {
      await sendEmail(
        admin.email,
        "New Ticket Created",
        `A new ticket ${incident.ticketId} has been created.`
      );
    }

    // 🔔 NOTIFICATIONS
    await Notification.create({
      user: req.user._id,
      role: "user",
      message: `Your ticket ${incident.ticketId} has been created`,
    });

    await Notification.create({
      role: "admin",
      message: `New ticket ${incident.ticketId} created`,
    });

    await Notification.create({
      role: "staff",
      message: `New ticket assigned to ${department} department`,
    });

    res.status(201).json(incident);
  } catch (err) {
    console.error("CREATE INCIDENT ERROR:", err);
    res.status(500).json({ message: "Ticket creation failed" });
  }
};
/* ===============================
   GET INCIDENT BY ID
================================ */

export const getIncidentById = async (req, res) => {
  try {
const incident = await Incident.findById(req.params.id)
  .populate({
    path: "comments.user",
    select: "full_name email", // optional
  })
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

    if (!message) {
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

    // 🔥 AUTO STATUS UPDATE
    if (
      req.user.role === "staff" &&
      incident.status === INCIDENT_STATUS.OPEN
    ) {
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

export const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      createdBy: req.user._id,
    })
      .sort({ createdAt: -1 })
      .select(
        "ticketId title status priority category createdAt"
      );

    res.json(incidents);
  } catch (error) {
    console.error("GET MY INCIDENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    if (!["staff", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status: newStatus } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const currentStatus = incident.status;

    // ✅ ADMIN CAN OVERRIDE ANY STATUS
    if (req.user.role !== "admin") {
      const allowedNext = allowedTransitions[currentStatus] || [];

      if (!allowedNext.includes(newStatus)) {
        return res.status(400).json({
          message: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        });
      }
    }

    incident.status = newStatus;
    await incident.save();

    // 🔔 Notify user when resolved
    if (newStatus === INCIDENT_STATUS.RESOLVED) {
      await Notification.create({
        user: incident.createdBy,
        role: "user",
        message: `Your ticket ${incident.ticketId} has been resolved`,
      });
    }

    res.json({
      message: "Status updated successfully",
      incident,
    });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const markResolved = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if(incident.status === INCIDENT_STATUS.CLOSED){
      return res.status(400).json({
        message: "Closed tickets cannot be modified"
      });
    }

    incident.status = INCIDENT_STATUS.RESOLVED;
    await incident.save();

    const io = req.app.get("io");
    io.to(incident.createdBy.toString()).emit("ticket_resolved", incident);

    res.json({ message: "Ticket marked as resolved" });

  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // 🧠 Save LLM metadata ONLY once
    if (!incident.llmMeta) {
      incident.llmMeta = {
        originalDepartment: incident.department,
        updatedByAdmin: false,
      };
    }

    // 🛠 Admin override
    incident.department = department;
    incident.llmMeta.updatedByAdmin = true;

    // Optional: unassign wrong staff
    incident.assignedTo = null;

    await AuditLog.create({
      incidentId: incident._id,
      originalDepartment: incident.llmMeta.originalDepartment,
      updateDepartment: department,
      updatedAt: req.user._id
    })

    await incident.save();

    // 🔔 Notify staff & admin
    const io = req.app.get("io");
    io.to("admin").emit("ticket_department_updated", incident);
    io.to(department).emit("ticket_assigned", incident);

    res.json({
      message: "Department overridden by admin",
      incident,
    });
  } catch (err) {
    console.error("UPDATE DEPARTMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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

      // 🧾 AUDIT LOG
      await AuditLog.create({
        incidentId: incident._id,
        action: "REPORT_DOWNLOADED",
        performedBy: req.user.id,
        role: req.user.role,
      });

      // 📧 EMAIL WITH PDF
      await sendEmailWithAttachment({
        to: incident.createdBy.email,
        subject: `Ticket Report - ${incident.ticketId}`,
        text: `Please find attached the report for ticket ${incident.ticketId}.`,
        filename: `${incident.ticketId}.pdf`,
        content: pdfBuffer,
      });

      // ⬇️ SEND TO BROWSER
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${incident.ticketId}.pdf`
      );
      res.send(pdfBuffer);
    });

    /* ======================
       PIPE FIRST (IMPORTANT)
    ====================== */
    const bgPath = path.join("assets", "AIMS.jpg");
    if (fs.existsSync(bgPath)) {
      doc.opacity(0.1);
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
      doc.opacity(1);
    }

    /* ======================
       REPORT CONTENT
    ====================== */
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
    incident.comments.forEach((c) => {
      doc.text(`• [${c.role}] ${c.message}`);
    });

    doc.end();
  } catch (err) {
    console.error("DOWNLOAD REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// router.get("/:id/report", protect, async (req, res) => {
//   const ticket = await Incident.findById(req.params.id);

//   if (!ticket) {
//     return res.status(404).json({ message: "Ticket not found" });
//   }

//   // Generate PDF or text
//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "attachment; filename=ticket.pdf");

//   res.send(pdfBuffer);
// });
export const getAssignedTickets = async (req, res) => {
  try {
    const staffId = req.user.id;
    const tickets = await Incident.find({ assignedTo: staffId });

    res.json({ tickets });
  }
  catch (err) {
    console.error("GET ASSIGNED TICKETS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
 