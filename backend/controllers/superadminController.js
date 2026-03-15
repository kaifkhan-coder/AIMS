import mongoose from "mongoose";
import Incident from "../models/incident.js";
import User from "../models/User.js";
import Notification from "../models/notification.js";
import RoleRequest from "../models/RoleRequest.js";
import SlaRule from "../models/SlaRule.js";
import AuditLog from "../models/AuditLog.js";

const MIN_ACCOUNT_AGE_DAYS = 7;
const COOLDOWN_DAYS = 30;
const REQUEST_EXPIRY_DAYS = 7;
const MIN_REASON_LENGTH = 30;

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export const createSelfRoleRequest = async (req, res) => {
  try {
    const requester = req.user; // from auth middleware
    const { requestedRole = "admin", reason = "" } = req.body;

    if (requestedRole !== "admin") {
      return res.status(400).json({ message: "Only admin role requests are allowed" });
    }

    const user = await User.findById(requester._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isActive) return res.status(403).json({ message: "Inactive users cannot request role changes" });

    if (user.role === "admin" || user.role === "super_admin") {
      return res.status(403).json({ message: "Admins/Super Admins cannot request role changes" });
    }

    const cleanReason = String(reason).trim();
    if (cleanReason.length < MIN_REASON_LENGTH) {
      return res.status(400).json({ message: `Reason must be at least ${MIN_REASON_LENGTH} characters` });
    }

    // ✅ FIX: correct account age calculation
    const createdAt = user.createdAt || user._id.getTimestamp();
    const accountAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge < MIN_ACCOUNT_AGE_DAYS) {
      return res.status(403).json({ message: `Account must be at least ${MIN_ACCOUNT_AGE_DAYS} days old` });
    }

    const pending = await RoleRequest.findOne({ targetUser: user._id, status: "pending" });
    if (pending) return res.status(409).json({ message: "You already have a pending role request" });

    const cooldownSince = addDays(new Date(), -COOLDOWN_DAYS);
    const recent = await RoleRequest.findOne({
      targetUser: user._id,
      status: { $in: ["approved", "rejected"] },
      reviewedAt: { $gte: cooldownSince },
    });
    if (recent) {
      return res.status(403).json({ message: `Wait ${COOLDOWN_DAYS} days between role requests` });
    }

    const expiresAt = addDays(new Date(), REQUEST_EXPIRY_DAYS);

    const roleRequest = await RoleRequest.create({
      targetUser: user._id,
      requestedRole: "admin",
      reason: cleanReason,
      status: "pending",
      expiresAt,
      requesterIp: getClientIp(req),
      requestedBy: user._id,
      requesterUserAgent: String(req.headers["user-agent"] || ""),
    });

    await AuditLog.create({
      action: "ROLE_REQUEST_CREATED_SELF",
      actor: user._id,
      targetUser: user._id,
      details: { roleRequestId: roleRequest._id, requestedRole: "admin", reason: cleanReason, expiresAt },
    });

    await Notification.create({
      recipient: "super_admin",
      title: `New Role Request from ${user.full_name}`,
      description: `${user.full_name} requested admin promotion`,
      type: "role_request",
      relatedId: roleRequest._id,
    });

    return res.status(201).json({ message: "Role request created", request: roleRequest });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Pending request already exists" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatternReport = async (req, res) => {
  try {
    const topRecurring = await Incident.aggregate([
      { $group: { _id: "$fingerprint", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
      { $match: { count: { $gte: 3 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const byDepartment = await Incident.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } }
    ]);

    res.json({ topRecurring, byDepartment });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
export const createRoleRequestBySuperAdmin = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only super_admin can create role requests for others" });
    }

    const { targetUserId, requestedRole = "admin", reason = "" } = req.body;
    if (!targetUserId) return res.status(400).json({ message: "targetUserId is required" });
    if (requestedRole !== "admin") return res.status(400).json({ message: "Only admin promotion allowed" });

    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: "Target user not found" });

    if (!target.isActive) return res.status(403).json({ message: "Target user is inactive" });
    if (target.role === "admin" || target.role === "super_admin") {
      return res.status(400).json({ message: "User is already admin/super_admin" });
    }

    const cleanReason = String(reason).trim();
    if (cleanReason.length < 10) {
      return res.status(400).json({ message: "Reason must be at least 10 characters" });
    }

    const pending = await RoleRequest.findOne({ targetUser: target._id, status: "pending" });
    if (pending) return res.status(409).json({ message: "Pending request already exists for this user" });

    const expiresAt = addDays(new Date(), REQUEST_EXPIRY_DAYS);

    const roleRequest = await RoleRequest.create({
      targetUser: target._id,
      requestedRole: "admin",
      reason: cleanReason,
      status: "pending",
      expiresAt,
      requesterIp: getClientIp(req),
      requestedBy: req.user._id,
      requesterUserAgent: String(req.headers["user-agent"] || ""),
    });

    await AuditLog.create({
      action: "ROLE_REQUEST_CREATED_BY_SUPER_ADMIN",
      actor: req.user._id,
      targetUser: target._id,
      details: { roleRequestId: roleRequest._id, requestedRole: "admin", reason: cleanReason, expiresAt },
    });

    return res.status(201).json({ message: "Role request created", request: roleRequest });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Pending request already exists" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveRoleRequest = async (req, res) => {
  try {
    const rr = await RoleRequest.findById(req.params.id);
    if (!rr) return res.status(404).json({ message: "Request not found" });

    if (rr.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    if (rr.expiresAt && new Date(rr.expiresAt).getTime() < Date.now()) {
      rr.status = "expired";
      rr.reviewedBy = req.user._id;
      rr.reviewedAt = new Date();
      rr.reviewNote = "Auto-expired before approval";
      await rr.save();
      return res.status(400).json({ message: "Request expired" });
    }

    const user = await User.findById(rr.targetUser);
    if (!user) return res.status(404).json({ message: "Target user not found" });

    const oldRole = user.role;
    user.role = "admin";
    await user.save();

    rr.status = "approved";
    rr.reviewedBy = req.user._id;
    rr.reviewedAt = new Date();
    await rr.save();

    await AuditLog.create({
      action: "ROLE_REQUEST_APPROVED",
      actor: req.user._id,
      targetUser: user._id,
      details: {
        oldRole,
        newRole: "admin",
        requestId: rr._id,
      },
    });

    // ✅ create DB notification
    await Notification.create({
      recipient: user._id,
      title: "Role Approved",
      description: "Your account has been promoted to Admin. Please login again to access admin features.",
      type: "role_update",
      relatedId: rr._id,
    });

    // ✅ realtime socket notification
    const io = req.app.get("io");

    io?.to(String(user._id)).emit("notification", {
      type: "success",
      message: "Your role has been upgraded to Admin. Please login again.",
    });

    // ✅ optional force logout so token/session refreshes
    io?.to(String(user._id)).emit("force_logout", {
      reason: "Your role has changed to Admin. Please login again.",
    });

    res.json({
      message: "Approved",
      user,
      request: rr,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const demoteAdmin = async (req, res) => {
  try {
    const { newRole } = req.body;

    if (!["user", "staff"].includes(String(newRole || "").toLowerCase())) {
      return res.status(400).json({ message: "newRole must be user or staff" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({ message: "Cannot demote super_admin" });
    }

    if (user.role !== "admin") {
      return res.status(400).json({ message: "Only admin can be demoted" });
    }

    const oldRole = user.role;
    user.role = newRole.toLowerCase();
    await user.save();

    await AuditLog.create({
      action: "ADMIN_DEMOTED",
      actor: req.user._id,
      targetUser: user._id,
      details: {
        oldRole,
        newRole: user.role,
      },
    });

    const io = req.app.get("io");

    io?.to(String(user._id)).emit("notification", {
      type: "warning",
      message: `Your role has been changed from ${oldRole} to ${user.role}`,
    });

    return res.json({
      message: `Admin demoted to ${user.role}`,
      user,
    });
  } catch (err) {
    console.error("DEMOTE ADMIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ super admin rejects
export const rejectRoleRequest = async (req, res) => {
  try {
    const { note = "" } = req.body;

    const rr = await RoleRequest.findById(req.params.id);
    if (!rr) return res.status(404).json({ message: "Request not found" });

    if (rr.status !== "pending") return res.status(400).json({ message: "Request already processed" });

    rr.status = "rejected";
    rr.reviewedBy = req.user._id;
    rr.reviewedAt = new Date();
    rr.reviewNote = String(note).slice(0, 250);
    await rr.save();

    await AuditLog.create({
      action: "ROLE_REQUEST_REJECTED",
      actor: req.user._id,
      targetUser: rr.targetUser,
      details: { requestId: rr._id, note: rr.reviewNote },
    });

    res.json({ message: "Rejected", request: rr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate("assignedTo", "full_name email department")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// export const getStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalIncidents = await Incident.countDocuments();
//     const openIncidents = await Incident.countDocuments({ status: "Open" });

//     const incidents = await Incident.find().select("createdAt status priority severity department");
//     const rules = await SlaRule.find({ isActive: true });

//     const slaMap = {};
//     for (const rule of rules) {
//       slaMap[rule.severity] = rule;
//     }

//     let slaBreaches = 0;

//     for (const incident of incidents) {
//       if (!incident.createdAt) continue;
//       if (incident.status === "RESOLVED" || incident.status === "CLOSED") continue;

//       const rule = slaMap[incident.priority] || slaMap[incident.severity];
//       const mins = rule?.resolveMinutes ?? 1440;

//       const ageMin = (Date.now() - new Date(incident.createdAt).getTime()) / 60000;
//       if (ageMin > mins) slaBreaches++;
//     }

//     const byDepartment = await Incident.aggregate([
//       { $group: { _id: "$department", count: { $sum: 1 } } },
//       { $project: { department: "$_id", count: 1, _id: 0 } },
//     ]);

//     const bySeverity = await Incident.aggregate([
//       { $group: { _id: "$severity", count: { $sum: 1 } } },
//       { $project: { severity: "$_id", count: 1, _id: 0 } },
//     ]);

//     res.json({
//       totalUsers,
//       totalIncidents,
//       openIncidents,
//       slaBreaches,
//       byDepartment,
//       bySeverity,
//       slaBreachesByDay: [],
//     });
//   } catch (err) {
//     console.error("GET STATS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIncidents = await Incident.countDocuments();

    const openIncidents = await Incident.countDocuments({
      status: { $in: ["Open", "Pending", "In Progress", "Reopened"] }
    });

    const incidents = await Incident.find().select(
      "createdAt status priority department"
    );

    const rules = await SlaRule.find({ isActive: true });

    const slaMap = {};
    for (const rule of rules) {
      slaMap[rule.severity] = rule;
    }

    let slaBreaches = 0;
    const breachMap = {};

    for (const incident of incidents) {
      if (!incident.createdAt) continue;
      if (["Resolved", "Closed"].includes(incident.status)) continue;

      const rule = slaMap[incident.priority];
      const mins = rule?.resolveMinutes ?? 1440;

      const ageMin =
        (Date.now() - new Date(incident.createdAt).getTime()) / 60000;

      if (ageMin > mins) {
        slaBreaches++;

        const day = new Date(incident.createdAt).toISOString().slice(0, 10);
        breachMap[day] = (breachMap[day] || 0) + 1;
      }
    }

    const slaBreachesByDay = Object.entries(breachMap)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day) - new Date(b.day));

    const byDepartment = await Incident.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } },
    ]);

    const bySeverity = await Incident.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { severity: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({
      totalUsers,
      totalIncidents,
      openIncidents,
      slaBreaches,
      byDepartment,
      bySeverity,
      slaBreachesByDay,
    });
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 80;

    const logs = await AuditLog.find()
      .populate("actor", "username full_name email role")
      .populate("updatedBy", "username full_name email role")
      .populate("performedBy", "username full_name email role")
      .populate("targetUser", "username full_name email role")
      .populate("targetId", "username full_name email role")
      .populate("incidentId", "ticketId title department status")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(logs);
  } catch (err) {
    console.error("SUPERADMIN AUDIT LOG ERROR:", err);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

export const getRoleRequests = async (req, res) => {
  try {
    const status = req.query.status || "pending";

    const requests = await RoleRequest.find({ status })
      .populate("targetUser", "full_name username email role isActive department")
      .populate("requestedBy", "full_name username email role")
      .populate("reviewedBy", "full_name username email role")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSlaRules = async (req, res) => {
    try {
        const rules = await SlaRule.find({ isActive: true }).sort({ resolveMinutes: 1 });
        // Placeholder for real SLA rule fetching logic
        res.json(rules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const createAutoIncident = async (req, res) => { 
    try {
        const { title, description, severity, department } = req.body;
        const incident = await Incident.create({
            title,
            description,
            severity,
            department,
            status: "Open",
            createdBy: "SYSTEM",
            source: "AUTO_MONITOR"
        });
        // Auto-assign to department staff
        const staff = await User.findOne({
            role: "staff",
            department
        });
        if(staff){
            incident.assignedTo = staff._id;
            await incident.save();
        }
        await Notification.create({
            role: department.toLowerCase(),
            message: `🚨 AUTO ALERT: ${incident.title}`
            });
            res.status(201).json({message: "Auto incident created", incident});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const resolveAutoIncident = async (req, res) => {
    try {
        const { title } = req.body;
        const incident = await Incident.findOneAndUpdate(
            { title, status: { $ne: "Closed" } },
            { status: "Closed", closedAt: new Date() },
            { new: true }
        );
        if (!incident) {
            return res.json({ message: "No open incident found" });
        }
        await Notification.create({
            message: `Auto Resolved: ${incident.title}`,
        });
        res.json({ message: "Auto incident resolved", incident });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }   
};

export const createRoleRequest = async (req, res) => {
  try {
    const { targetUserId, requestedRole = "admin", reason = "" } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    if (requestedRole !== "admin") {
      return res.status(400).json({ message: "Only admin role request is allowed" });
    }

    const target = await User.findById(targetUserId);
    if (!target) {
      return res.status(404).json({ message: "Target user not found" });
    }       

    if (target.role === "super_admin") {
      return res.status(403).json({ message: "Cannot change super_admin role" });
    }

    if (target.role === "admin") {
      return res.status(400).json({ message: "User is already admin" });
    }

    const pending = await RoleRequest.findOne({
      targetUser: targetUserId,
      status: "pending",
    });

    if (pending) {
      return res.status(409).json({ message: "Pending request already exists" });
    }

    const cleanReason = String(reason).trim();
    const expiresAt = addDays(new Date(), REQUEST_EXPIRY_DAYS);

    const reqDoc = await RoleRequest.create({
      targetUser: targetUserId,
      requestedRole: "admin",
      reason: cleanReason || "Promotion requested by super admin",
      status: "pending",
      requestedBy: req.user._id,
      requesterIp: getClientIp(req),
      requesterUserAgent: String(req.headers["user-agent"] || ""),
      expiresAt,
    });

    await AuditLog.create({
      action: "ROLE_REQUEST_CREATED_BY_SUPER_ADMIN",
      actor: req.user._id,
      targetUser: target._id,
      details: {
        roleRequestId: reqDoc._id,
        requestedRole: "admin",
        reason: reqDoc.reason,
        expiresAt,
      },
    });

    return res.status(201).json({
      message: "Role request created",
      request: reqDoc,
    });
  } catch (err) {
    console.error("CREATE ROLE REQUEST ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// export const blockUser = async (req, res) => {
//   try {
//     console.log("Blocking user", req.params.id);
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { isActive: false },
//       { new: true }
//     ).select("-password");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // ✅ Get io from app (you already set app.set("io", io))
//     const io = req.app.get("io");

//     // ✅ Emit logout to that user's room
//     io.to(String(user._id)).emit("force_logout", {
//       reason: "Your account has been blocked by Super Admin",
//     });

//     // (optional) also emit to your other room naming if you use it:
//     io.to(`user_${user._id}`).emit("force_logout", {
//       reason: "Your account has been blocked by Super Admin",
//     });

//     await AuditLog.create({
//       action: "USER_BLOCKED",
//       actor: req.user._id,
//       targetUser: user._id,
//       details: { isActive: false },
//     });

//     res.json({ message: "User blocked", user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const blockUser = async (req, res) => {
  try {
    const reason = String(req.body.reason || "").trim();

    if (!reason) {
      return res.status(400).json({ message: "Block reason is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        blockReason: reason,
        blockedAt: new Date(),
        blockedBy: req.user._id,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const io = req.app.get("io");

    io?.to(String(user._id)).emit("force_logout", {
      reason: `Your account has been blocked. Reason: ${reason}`,
    });

    await AuditLog.create({
      action: "USER_BLOCKED",
      actor: req.user._id,
      targetUser: user._id,
      details: {
        isActive: false,
        reason,
      },
    });

    return res.json({
      message: "User blocked",
      user,
    });
  } catch (err) {
    console.error("BLOCK USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// export const unblockUser = async (req, res) => {
//   try {
//     console.log("UNBLOCK REQUEST ID:", req.params.id);

//     const result = await User.updateOne(
//       { _id: req.params.id },
//       { $set: { isActive: true } }
//     );

//     console.log("UNBLOCK UPDATE RESULT:", result);

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const updatedUser = await User.findById(req.params.id).select("-password");
//     console.log("UPDATED USER AFTER UNBLOCK:", updatedUser);

//     const io = req.app.get("io");
//     io?.to(String(updatedUser._id)).emit("account_unblocked", {
//       message: "Your account has been unblocked. Please login again."
//     });

//     await AuditLog.create({
//       action: "USER_UNBLOCKED",
//       actor: req.user._id,
//       targetUser: updatedUser._id,
//       details: { isActive: true },
//     });

//     return res.json({
//       message: "User unblocked successfully",
//       user: updatedUser,
//       updateResult: result,
//     });
//   } catch (err) {
//     console.error("UNBLOCK ERROR:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export const createRoleRequest = async (req, res) => {
//   try {
//     const { targetUserId, requestedRole, reason } = req.body;

//     if (!targetUserId || !requestedRole) {
//       return res.status(400).json({ message: "targetUserId and requestedRole are required" });
//     }

//     if (!["admin", "staff", "user"].includes(requestedRole)) {
//       return res.status(400).json({ message: "Invalid requestedRole" });
//     }

//     const target = await User.findById(targetUserId);
//     if (!target) return res.status(404).json({ message: "Target user not found" });

//     // Prevent changing super admin via requests
//     if (target.role === "super_admin") {
//       return res.status(403).json({ message: "Cannot change super_admin role" });
//     }

//     // Avoid duplicate pending request
//     const exists = await RoleRequest.findOne({
//       targetUser: targetUserId,
//       requestedRole,
//       status: "pending",
//     });
//     if (exists) return res.status(409).json({ message: "Pending request already exists" });

//     const reqDoc = await RoleRequest.create({
//       targetUser: targetUserId,
//       requestedRole,
//       reason: reason || "",
//       requestedBy: req.user._id, // from protect middleware
//     });

//     res.status(201).json({ message: "Role request created", request: reqDoc });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const approveRoleRequest = async (req, res) => {
//   try {
//     const requestId = req.params.id;

//     const rr = await RoleRequest.findById(requestId);
//     if (!rr) return res.status(404).json({ message: "Role request not found" });
//     if (rr.status !== "pending") return res.status(400).json({ message: "Request already processed" });

//     const target = await User.findById(rr.targetUser);
//     if (!target) return res.status(404).json({ message: "Target user not found" });
//     if (target.role === "super_admin") return res.status(403).json({ message: "Cannot change super_admin role" });

//     const oldRole = target.role;
//     target.role = rr.requestedRole;
//     await target.save();

//     rr.status = "approved";
//     rr.reviewedBy = req.user._id;
//     rr.reviewedAt = new Date();
//     await rr.save();

//     // Audit log (optional but recommended)
//     if (AuditLog) {
//       await AuditLog.create({
//         action: "ROLE_APPROVED",
//         actor: req.user._id,
//         targetUser: target._id,
//         details: { requestId, oldRole, newRole: rr.requestedRole, reason: rr.reason },
//       });
//     }

//     res.json({ message: "Role request approved", user: target, request: rr });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true,
        blockReason: "",
        blockedAt: null,
        blockedBy: null,
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const io = req.app.get("io");
    io?.to(String(user._id)).emit("account_unblocked", {
      message: "Your account has been unblocked. Please login again.",
    });

    await AuditLog.create({
      action: "USER_UNBLOCKED",
      actor: req.user._id,
      targetUser: user._id,
      details: { isActive: true },
    });

    return res.json({ message: "User unblocked", user });
  } catch (err) {
    console.error("UNBLOCK ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateSlaRule = async (req, res) => {
  try {
    const id = req.params.id;
    const patch = {};

    if (req.body.responseMinutes !== undefined) patch.responseMinutes = Number(req.body.responseMinutes);
    if (req.body.resolveMinutes !== undefined) patch.resolveMinutes = Number(req.body.resolveMinutes);
    if (req.body.isActive !== undefined) patch.isActive = Boolean(req.body.isActive);
    patch.updatedBy = req.user._id;

    const rule = await SlaRule.findByIdAndUpdate(id, patch, { new: true });
    if (!rule) return res.status(404).json({ message: "SLA rule not found" });

    if (AuditLog) {
      await AuditLog.create({
        action: "SLA_UPDATED",
        actor: req.user._id,
        details: { slaRuleId: id, patch },
      });
    }
   await Notification.create([
  {
    title: "SLA Rule Updated",
    description: `SLA updated: ${rule.severity} | Response ${rule.responseMinutes} min | Resolve ${rule.resolveMinutes} min`,
    type: "sla_update",
    recipientRole: "admin",
  },
  {
    title: "SLA Rule Updated",
    description: `SLA updated: ${rule.severity} | Response ${rule.responseMinutes} min | Resolve ${rule.resolveMinutes} min`,
    type: "sla_update",
    recipientRole: "staff",
  },
]);

    res.json({ message: "SLA rule updated", rule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createSlaRule = async (req, res) => {
  try {
    const { severity, responseMinutes, resolveMinutes, isActive = true } = req.body;

    if (!severity || responseMinutes === undefined || resolveMinutes === undefined) {
      return res.status(400).json({
        message: "severity, responseMinutes and resolveMinutes are required",
      });
    }

    const rule = await SlaRule.create({
      severity,
      responseMinutes: Number(responseMinutes),
      resolveMinutes: Number(resolveMinutes),
      isActive,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      action: "SLA_CREATED",
      actor: req.user._id,
      details: {
        slaRuleId: rule._id,
        severity,
        responseMinutes: Number(responseMinutes),
        resolveMinutes: Number(resolveMinutes),
        isActive,
      },
    });
    await Notification.create([
  {
    title: "New SLA Rule Created",
    description: `SLA created: ${rule.severity} | Response ${rule.responseMinutes} min | Resolve ${rule.resolveMinutes} min`,
    type: "sla_update",
    recipientRole: "admin",
  },
  {
    title: "New SLA Rule Created",
    description: `SLA created: ${rule.severity} | Response ${rule.responseMinutes} min | Resolve ${rule.resolveMinutes} min`,
    type: "sla_update",
    recipientRole: "staff",
  },
]);

    return res.status(201).json({
      message: "SLA rule created",
      rule,
    });
  } catch (err) {
    console.error("CREATE SLA RULE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteSlaRule = async (req, res) => {
  try {
    const id = req.params.id;
    const rule = await
      SlaRule.findByIdAndDelete(id);
    if (!rule) return res.status(404).json({ message: "SLA rule not found" });

    await AuditLog.create({
      action: "SLA_DELETED",
      actor: req.user._id,
      details: { slaRuleId: id, severity: rule.severity },
    });
    await Notification.create([
  {
    title: "SLA Rule Deleted",
    description: `SLA deleted: ${rule.severity}`,
    type: "sla_update",
    recipientRole: "admin",
  },
  {
    title: "SLA Rule Deleted",
    description: `SLA deleted: ${rule.severity}`,
    type: "sla_update",
    recipientRole: "staff",
  },
]);
    res.json({ message: "SLA rule deleted", rule });
  } catch (err) {
    console.error("DELETE SLA RULE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getSuperAdminAuditLogs = async (req, res) => {
//   try {
//     const limits = parseInt(req.query.limit) || 80;
//     const logs = await AuditLog.find()
//     .populate("updatedBy", "username full_name email role")
//     .populate("performedBy", "username full_name email role")
//     .populate("targetUser", "username full_name email role")
//     .populate("targetId", "username full_name email role")
//     .populate("incidentId", "ticketId title department status")
//     .sort({ createdAt: -1 })
//     .limit(limit);
//     res.json(logs);
//   }catch(error){
//     console.log("SUPERADMIN AUDIT LOG ERROR:", error);
//     res.status(500).json({ message: "Failed to fetch audit logs"});
//   }
// };