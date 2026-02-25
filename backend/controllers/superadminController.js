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
    return(
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        ""
    );
}

export const createRoleRequest = async (req, res) => {
    try {
        const requester = req.user;
        const { requestedRole = "admin", reason = "" } = req.body;

        if(requestedRole !== "admin"){
            return res.status(400).json({ message: "Only admin role requests are allowed" });
        }
        
        const user = await User.findById(requester._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "super_admin") {
            return res.status(403).json({ message: "Super admin already has highest role" });
        }

        if(!user.isActive){
            return res.status(403).json({ message: "Inactive users cannot request role changes" });
        }

        if(user.role === "admin" || user.role === "super_admin"){
            return res.status(403).json({ message: "Admins and Super Admins cannot request role changes" });
        }

        const cleanReason = reason.trim();
        if(cleanReason.length < MIN_REASON_LENGTH){
            return res.status(400).json({ message: `Reason must be at least ${MIN_REASON_LENGTH} characters` });
        }
        const createdAt = user.createdAt || user._id.getTimestamp();
        const accountAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

        if(user.accountAge < MIN_ACCOUNT_AGE_DAYS){
            return res.status(403).json({ message: "Users must have an account age of at least 7 days to request role changes" });
        }

        const pending = await RoleRequest.findOne({ 
            targetUser: requester._id,
            status: "pending"
        });
        if(pending){
            return res.status(409).json({ message: "You already have a pending role request" });
        }

        const cooldownSince = addDays(new Date(), -COOLDOWN_DAYS);
        const recentRequest = await RoleRequest.findOne({
            targetUser: requester._id,
            status: { $in: ["approved", "rejected"] },
            reviewedAt: { $gte: cooldownSince }
        });
        if(recentRequest){
            return res.status(403).json({ message: `You must wait ${COOLDOWN_DAYS} days between role requests` });
        }
                // const existingRequest = await RoleRequest.findOne({
        //     targetUser: requester._id,
        //     status: "pending"
        // });

        // if(existingRequest){
        //     return res.status(409).json({ message: "You already have a pending role request" });
        // }

        const expiryDate = addDays(new Date(), REQUEST_EXPIRY_DAYS);

        const roleRequest = await RoleRequest.create({
            targetUser: requester._id,
            requestedRole: "admin",
            reason: cleanReason,
            status: "pending",
            expiryDate,
            requesterIp: getClientIp(req),
            requestedBy: requester._id,
            requesterUserAgent: String(req.headers['user-agent'] || ""),
        });

        await AuditLog.create({
            action: "ROLE_REQUEST_CREATED",
            actor: requester._id,
            targetUser: requester._id,
            details: { roleRequestId: roleRequest._id, requestedRole: "admin", reason: cleanReason, expiresAt: expiryDate },
        });

        // Create notification for super admin
        await Notification.create({
            recipient: "super_admin",
            title: `New Role Request from ${requester.full_name}`,
            description: `${requester.full_name} has requested to be promoted to ${requestedRole}`,
            type: "role_request",
            relatedId: roleRequest._id
        });

        return res.status(201).json({ message: "Role request created", request: roleRequest }); 
        res.json(roleRequest);
    } catch (err) {
        if(err?.code === 11000){
            return res.status(409).json({ message: "You already have a pending role request" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const approveRoleRequest = async (req, res) => {
  try {
    const rr = await RoleRequest.findById(req.params.id);
    if (!rr) return res.status(404).json({ message: "Request not found" });

    if (rr.status !== "pending") return res.status(400).json({ message: "Request already processed" });

    // expiry check
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

    // never allow setting super_admin here
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
      details: { oldRole, newRole: "admin", requestId: rr._id },
    });

    res.json({ message: "Approved", user, request: rr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({ status: "OPEN" });
    const slaBreaches = await Incident.countDocuments({ slaBreached: true });

    const byDepartment = await Incident.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { department: "$_id", count: 1, _id: 0 } },
    ]);

    const bySeverity = await Incident.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $project: { severity: "$_id", count: 1, _id: 0 } },
    ]);

    res.json({
      totalUsers,
      totalIncidents,
      openIncidents,
      slaBreaches,
      byDepartment,
      bySeverity,
      slaBreachesByDay: [],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAuditLogs = async (req, res) => {
    try {
        // Placeholder for real audit log fetching logic    
        res.json([]);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
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

    res.json({ message: "SLA rule updated", rule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

