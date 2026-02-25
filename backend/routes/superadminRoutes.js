import express from "express";
import { requireSuperAdmin, protect } from "../middleware/autMiddleware.js";
import { getAuditLogs, getIncidents, getRoleRequests, getSlaRules, getStats, getUsers, resolveAutoIncident, createRoleRequest, createAutoIncident, approveRoleRequest, updateSlaRule, rejectRoleRequest} from "../controllers/superadminController.js";

const router = express.Router();

router.get("/ping", (req, res) => res.json({ ok: true, route: "superadmin" }));

router.get("/stats", protect, requireSuperAdmin, getStats);
router.get("/users", protect, requireSuperAdmin, getUsers);
router.get("/incidents", protect, requireSuperAdmin, getIncidents);
router.get("/audit-logs", protect, requireSuperAdmin, getAuditLogs);
router.get("/role-requests", protect, requireSuperAdmin, getRoleRequests);
router.get("/sla-rules", protect, requireSuperAdmin, getSlaRules);

router.post("/role-requests", (req, res) => {
  res.json({ ok: true, msg: "POST role-requests works" });
});
router.post("/role-request", protect, createRoleRequest);
router.post("/auto-incident", protect, requireSuperAdmin, createAutoIncident);
router.post("/role-request/:id/approve", protect, requireSuperAdmin, approveRoleRequest);
router.post("/role-request/:id/reject", protect, requireSuperAdmin, rejectRoleRequest);

// router.post("/sla-rules", protect, requireSuperAdmin, createSlaRule);
router.post("/update-sla-rule/:id", protect, requireSuperAdmin, updateSlaRule);
router.post("/resolve-auto-incident/:id", protect, requireSuperAdmin, resolveAutoIncident);

export default router;