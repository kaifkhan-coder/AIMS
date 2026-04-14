import express from "express";
import Incident from "../models/Incident.js";
import { autoAssignStaff } from "../services/autoAssign.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const incident = await Incident.create(req.body);

  const staff = await autoAssignStaff(incident.department);

  if (staff) {
    incident.assignedTo = staff._id;
    incident.status = "assigned";
    await incident.save();
  }

  res.json(incident);
});

export default router;
