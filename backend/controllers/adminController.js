import dotenv from "dotenv";
dotenv.config();
import sendEmail from "../utils/sendEmail.js";
import { otpEmailTemplate } from "../utils/emailTemplates.js";
import User from "../models/User.js";
import Staff from "../models/staff.js";
import Incident from "../models/incident.js";
import bcrypt from "bcryptjs";
import openai, { classifyIncident } 
from "../llmService.js";
import { protect, roleCheck } from "../middleware/autMiddleware.js";
import AuditLog from "../models/AuditLog.js";
import QRCode from "qrcode";
console.log("FRONTEND_URL:", process.env.FRONTEND_URL); // DEBUG
export const getAllIncidentsForAdmin = [
  protect,
  roleCheck("admin"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.department) filter.department = req.query.department;
      if (req.query.search) {
        filter.title = { $regex: req.query.search, $options: "i" };
      }

      const [incidents, total] = await Promise.all([
        Incident.find(filter)
          .populate("createdBy", "username email")
          .populate("assignedTo", "full_name department")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Incident.countDocuments(filter)
      ]);

      res.json({
        incidents,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
];
export const reassignStaffDepartment = async (req, res) => {
  console.log("ID RECEIVED:", req.params.id);
console.log("BODY:", req.body);
  const { department } = req.body;

  const user = await User.findById(req.params.id);
  if (!user || user.role !== "staff") {
    return res.status(404).json({ message: "Staff not found" });
  }

  user.department = department;
  await user.save();

  await AuditLog.create({
    action: "STAFF_DEPARTMENT_CHANGED",
    updatedBy: req.user.id,
    targetId: user._id,
  });

  res.json({ message: "Staff department updated" });
};

export const reassignTicketDepartment = async (req, res) => {
  const { department } = req.body;

  const ticket = await Incident.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  ticket.department = department;
  await ticket.save();

  await AuditLog.create({
    action: "TICKET_DEPARTMENT_CHANGED",
    updatedBy: req.user.id,
    targetId: ticket._id,
  });

  res.json({ message: "Ticket department updated" });
};

export const getLlmAccuracy = async (req, res) => {
  const total = await Incident.countDocuments({
    llmMeta: { $exists: true }
  });

  const correct = await Incident.countDocuments({
    "llmMeta.updatedByAdmin": false
  });

  const incorrect = total - correct;

  res.json([
    { name: "Correct", count: correct },
    { name: "Incorrect", count: incorrect }
  ]);
};

export const getAllIncidents = async (req, res) => {
  const incidents = await Incident.find()
    .populate("createdBy", "username")
    .sort({ createdAt: -1 });

  res.json(incidents);
};
export const getAssignedTickets = async (req, res) => {
  try {
    console.log("AUTH USER:", req.user); // DEBUG LINE

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Access denied" });
    }

    const tickets = await Incident.find({
      assignedTo: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ tickets });

  } catch (err) {
    console.error("GET ASSIGNED TICKETS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
/* ===============================
   CREATE INCIDENT (WITH LLM)
================================ */
export const createIncident = async (req, res) => {
  try {
    const { title, description, createdBy } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title & description required" });
    }

    // 🔥 LLM CLASSIFICATION
    const aiResult = await classifyIncident(title, description);

    const incident = await Incident.create({
      title,
      description,
      department: aiResult.department,
      priority: aiResult.priority,
      createdBy
    });

    if (aiResult.priority === "High") {
      // notifyStaffImmediately(incident.department);
      console.log("🚨 High priority incident");
    }

    res.status(201).json(incident);
  } catch (err) {
    console.error("CREATE INCIDENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   STAFF AI SUMMARY
================================ */
export async function generateStaffSummary(tickets) {
  const prompt = `
Summarize these tickets for staff in 2 lines:

${tickets.map(t => `- ${t.title}: ${t.status}`).join("\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
};

export const createStaff = async (req, res) => {
  try {
    const { full_name, email, username, password, department } = req.body;

    if (!full_name || !email || !username || !password || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.includes(" ")) {
      return res.status(400).json({ message: "Username cannot contain spaces" });
    }

    const exists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (exists) {
      return res.status(400).json({
        message: `Account already exists as ${exists.role}`
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // await User.create({
    //   full_name,
    //   email,
    //   username: username.toLowerCase(),
    //   password: hashedPassword,
    //   department,
    //   role: "staff",
    //   isVerified: false,
    //   otp: hashedOtp,
    //   otpExpires: Date.now() + 10 * 60 * 1000
    // });

    await sendEmail(
      email,
      "Verify your Staff Account",
      otpEmailTemplate(otp, email)
    );
const newStaff = await User.create({
  full_name,
  email,
  username: username.toLowerCase(),
  password: hashedPassword,
  department,
  role: "staff",
  isVerified: false,
  otp: hashedOtp,
  otpExpires: Date.now() + 10 * 60 * 1000
});

await AuditLog.create({
  action: "STAFF_CREATED",
  updatedBy: req.user._id,
  details: {
    staffId: newStaff._id,
    full_name: newStaff.full_name,
    email: newStaff.email,
    department: newStaff.department,
  },
});
// ✅ Generate QR URL
const qrData = `${process.env.FRONTEND_URL}/verify/${newStaff._id}`;
console.log("QR DATA:", qrData); // DEBUG

// ✅ Generate QR Image
const qrCode = await QRCode.toDataURL(qrData);

// ✅ Save QR in DB
newStaff.qrCode = qrCode;
await newStaff.save();
res.status(201).json({
  message: "Staff created",
  staff: newStaff
});

  } catch (err) {
    console.error("CREATE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   DELETE STAFF
================================ */
export const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    await staff.deleteOne();
    await AuditLog.create({
  action: "STAFF_DELETED",
  updatedBy: req.user._id,
  details: {
    staffId: staff._id,
    full_name: staff.full_name,
    email: staff.email,
    department: staff.department,
  },
});
    res.json({ message: "Staff deleted successfully" });

  } catch (err) {
    console.error("DELETE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   MANUAL DEPT CORRECTION
================================ */

// export const reassignDepartment = async (req, res) => {
//   try {
//     const { department } = req.body;

//     const incident = await Incident.findById(req.params.id);
//     if (!incident) {
//       return res.status(404).json({ message: "Incident not found" });
//     }

//     incident.department = department;
//     await incident.save();

//     res.json({
//       message: "Department reassigned successfully",
//       incident,
//     });
//   } catch (err) {
//     console.error("REASSIGN ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const reassignDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const oldDepartment = incident.department;

    const newStaff = await User.findOne({
      role: "staff",
      department,
      isActive: true,
    }).select("_id full_name department");

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          department,
          assignedTo: newStaff ? newStaff._id : null,
        },
      },
      {
        new: true,
        runValidators: false,
      }
    )
      .populate("createdBy", "username email")
      .populate("assignedTo", "full_name department");

    const io = req.app.get("io");

    io?.to("admin").emit("ticket_department_updated", {
      ticketId: updatedIncident._id,
      title: updatedIncident.title,
      oldDepartment,
      newDepartment: department,
      assignedTo: updatedIncident.assignedTo,
    });

    await AuditLog.create({
      action: "TICKET_DEPARTMENT_CHANGED",
      incidentId: updatedIncident._id,
      updatedBy: req.user._id,
      originalDepartment: oldDepartment,
      updatedDepartment: department,
      details: {
        ticketId: updatedIncident.ticketId,
        assignedToName: newStaff?.full_name || "Unassigned",
      },
    });

    res.json({
      message: "Department reassigned successfully",
      incident: updatedIncident,
    });
  } catch (err) {
    console.error("REASSIGN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalStaff = await User.countDocuments({ role: "staff" });
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({
      status: { $ne: "Resolved" }
    });

    const resolvedIncidents = await Incident.countDocuments({
      status: "Resolved"
    });

    res.json({
      totalUsers,
      totalStaff,
      totalIncidents,
      openIncidents,
      resolvedIncidents
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

export const getMostActiveStaff = async (req, res) => {
  const data = await Incident.aggregate([
    { $match: { assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        handled: { $sum: 1 }
      }
    },
    { $sort: { handled: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "staffs",
        localField: "_id",
        foreignField: "_id",
        as: "staff"
      }
    },
    { $unwind: "$staff" },
    {
      $project: {
        name: "$staff.full_name",
        handled: 1
      }
    }
  ]);

  res.json(data);
};

export const getIncidentByDepartment = async (req, res) => {
  const data = await Incident.aggregate([
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(
    data.map(d => ({
      department: d._id,
      count: d.count
    }))
  );
};

export const getAvgResolutionTime = async (req, res) => {
  try {
    const data = await Incident.aggregate([
      {
        $match: {
          status: { $in: ["Resolved", "Closed"] },
          createdAt: { $exists: true },
          // resolvedAt: { $exists: true, $ne: null }
          resolvedAt: new Date() // Exclude null/undefined resolvedAt
        }
      },
      {
        $project: {
          diff: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$diff" }
        }
      }
    ]);

    res.json({ avgMinutes: Math.round(data[0]?.avgTime || 0) });
  } catch (err) {
    console.error("AVG RESOLUTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};