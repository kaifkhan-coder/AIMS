import express from "express";
import { requireSuperAdmin, protect } from "../middleware/autMiddleware.js";
// import { getAuditLogs, blockUser, unblockUser, getIncidents, getRoleRequests, createSelfRoleRequest, getSlaRules, getStats, getUsers, resolveAutoIncident, createRoleRequest, createAutoIncident, approveRoleRequest, updateSlaRule, rejectRoleRequest, getPatternReport} from "../controllers/superadminController.js";
import {
  getAuditLogs,
  blockUser,
  unblockUser,
  getIncidents,
  getRoleRequests,
  createSelfRoleRequest,
  createRoleRequestBySuperAdmin,
  getSlaRules,
  getStats,
  getUsers,
  resolveAutoIncident,
  createAutoIncident,
  approveRoleRequest,
  updateSlaRule,
  rejectRoleRequest,
  getPatternReport,
  createSlaRule,
  demoteAdmin,
} from "../controllers/superadminController.js";

const router = express.Router();

router.get("/ping", (req, res) => res.json({ ok: true, route: "superadmin" }));

router.get("/stats", protect, requireSuperAdmin, getStats);
router.get("/users", protect, requireSuperAdmin, getUsers);
router.get("/incidents", protect, requireSuperAdmin, getIncidents);
router.get("/audit-logs", protect, requireSuperAdmin, getAuditLogs);
// router.get("/audit-logs", protect, requireSuperAdmin, getSuperAdminAuditLogs);
router.get("/role-requests", protect, requireSuperAdmin, getRoleRequests);
router.get("/sla-rules", protect, requireSuperAdmin, getSlaRules);
router.get("/patterns", protect, requireSuperAdmin, getPatternReport);

router.patch("/users/:id/block", protect, requireSuperAdmin, blockUser);
router.patch("/users/:id/unblock", protect, requireSuperAdmin, unblockUser);
router.patch("/users/:id/demote", protect, requireSuperAdmin, demoteAdmin);

router.post("/role-request", protect, createSelfRoleRequest);
router.post("/role-request-by-superadmin", protect, requireSuperAdmin, createRoleRequestBySuperAdmin);
router.post("/auto-incident", protect, requireSuperAdmin, createAutoIncident);
router.post("/role-requests/:id/approve", protect, requireSuperAdmin, approveRoleRequest);
router.post("/role-requests/:id/reject", protect, requireSuperAdmin, rejectRoleRequest);

router.post("/sla-rules", protect, requireSuperAdmin, createSlaRule);
router.patch("/sla-rules/:id", protect, requireSuperAdmin, updateSlaRule);
router.post("/resolve-auto-incident/:id", protect, requireSuperAdmin, resolveAutoIncident);

export default router;