  import express from "express";
  import multer from "multer";
  import mongoose from "mongoose";
  import User from "../models/User.js";
  import {
    createIncident,
    getIncidentById,
    addComment,
    getMyIncidents,
    markResolved,
    updateDepartment,
    updateIncidentStatus,
    downloadIncidentReport
  } from "../controllers/incidentController.js";
  import { protect, roleCheck } from "../middleware/autMiddleware.js";
  import Notification from "../models/notification.js";
  import Incident from "../models/incident.js"

  const router = express.Router();

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const upload = multer({ storage });

  // CREATE INCIDENT
    
router.get("/assigned", protect, async (req, res) => {
  try {
    const staffId = req.user?.id || req.user?._id;

    if (!staffId) return res.status(401).json({ message: "No user id in token" });
    if (!mongoose.Types.ObjectId.isValid(staffId))
      return res.status(400).json({ message: "Invalid user id" });

    console.log("STAFF (token) id:", staffId);

    const incidents = await Incident.find({
      assignedTo: new mongoose.Types.ObjectId(staffId),
    }).sort({ createdAt: -1 });

    console.log("MATCH COUNT:", incidents.length);

    return res.json({ tickets: incidents });
  } catch (err) {
    console.error("ASSIGNED ERROR:", err);
    return res.status(500).json({ message: "Failed to load assigned tickets" });
  }
});
  // router.get("/assigned", protect, async (req, res) => {
  //   try {
  //     const incidents = await Incident.find({
  //       assignedTo: req.user.id,
  //     }).sort({ createdAt: -1 });
  
  //     res.json({ tickets: incidents });
  //   } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: "Failed to load assigned tickets" });
    //   }
    // });
    
    router.get("/my", protect, getMyIncidents);

  router.post("/auto", async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    // 🔁 Prevent duplicate auto tickets
    const existing = await Incident.findOne({
      title,
      status: { $ne: "Closed" }
    });

    if (existing) {
      return res.json({ message: "Incident already exists" });
    }

    const incident = await Incident.create({
      title: "Network Down",
      description: "Network connectivity lost (auto detected)",
      priority: "High",
      category: "Network",
      status: "Open",
      assignedDepartment : "Network", 
      createdBy: "SYSTEM",
      source: "AUTO_MONITOR"
    });

    const networkStaff = await User.findOne({
      role: "staff",
      department: "Network"
    });
    if(networkStaff){
      incident.assignedTo = networkStaff._id;
      await incident.save();
    }
    await Notification.create({
      role: "network",
      message: `🚨 AUTO ALERT: ${incident.title}`,
      read: false
    });

    res.status(201).json({
      message: "Auto incident created",
      incident
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/auto/resolved", async (req, res) => {
  try {
    const {title} = req.body;
    const incident = await Incident.findOneAndUpdate(
      {title, status: {$ne: "Closed"} },
      {
        status: "Closed",
        closedAt: new Date()
      },
      {new: true}
    );
    if(!incident){
      return res.json({message: "No open incident found" } );
    }
    await Notification.create({
      message: `Auto Resolved ${incident.title} `,
      read: false
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
});
  
  router.get("/:id/report", protect, downloadIncidentReport);

        router.get("/:id", protect, getIncidentById);
        
  router.post("/", protect, upload.single("attachment"), protect, createIncident);

  router.post("/:id/comment", protect, addComment);

  router.put("/:id/status", protect, roleCheck("admin", "staff"), updateIncidentStatus);

  router.put("/:id/resolve", protect, roleCheck("admin", "staff"), markResolved);

  router.put("/:id/department", protect, roleCheck("admin"), updateDepartment);


  export default router;
