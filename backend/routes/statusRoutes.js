import express from "express";
import Incident from "../models/incident.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: "Pending" });
    const critical = await Incident.countDocuments({ priority: "High" });

    let systemStatus = "Healthy";

    if (critical > 5) systemStatus = "Critical";
    else if (pending > 10) systemStatus = "Warning";

    res.json({
      status: systemStatus,
      uptime: process.uptime(),
      totalIncidents,
      pending,
      critical,
    });

  } catch (err) {
    res.status(500).json({ status: "Down" });
  }
});

export default router;