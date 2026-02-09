  import express from "express";
  import multer from "multer";
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

  // router.post("/", protect, async (req, res) => {
  //   try {
  //     const { title, description, category, priority } = req.body;

  //     // 🔥 auto-detect department
  //     const department = getDepartmentByCategory(category);

  //     const ticket = await Incident.create({
  //       title,
  //       description,
  //       category,
  //       priority,
  //       createdBy: req.user.id,
  //       assignedDepartment: department
  //     });

  //     const io = req.app.get("io");

  //     /* 🔔 NOTIFICATIONS */

  //     // User
  //     await Notification.create({
  //       user: req.user.id,
  //       role: "user",
  //       message: `Ticket created and assigned to ${department} department`
  //     });

  //     // Admin
  //     await Notification.create({
  //       role: "admin",
  //       message: `New ticket assigned to ${department} department`
  //     });

  //     // Staff (department-based)
  //     await Notification.create({
  //       role: department.toLowerCase(),
  //       message: `New ticket received for ${department} department`
  //     });

  //     // 🔴 SOCKET EVENTS
  //     io.to(req.user.id).emit("ticket_created", {
  //       message: "Your ticket has been created successfully"
  //     });

  //     io.to("admin").emit("ticket_created", {
  //       message: `New ${department} ticket created`
  //     });

  //     io.to(department.toLowerCase()).emit("ticket_assigned", {
  //       message: `New ticket assigned to your department`
  //     });

  //     res.status(201).json(ticket);

  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: "Ticket creation failed" });
  //   }
  // });
  router.get("/assigned", protect, async (req, res) => {
    try {
      const incidents = await Incident.find({
        assignedTo: req.user.id,
      }).sort({ createdAt: -1 });

      res.json({ tickets: incidents });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load assigned tickets" });
    }
  });

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

  router.post("/", protect, upload.single("attachment"), protect, createIncident);

  router.get("/my", protect, getMyIncidents);

  router.get("/:id", protect, getIncidentById);

  router.post("/:id/comment", protect, addComment);

  router.put("/:id/status", protect, roleCheck("admin", "staff"), updateIncidentStatus);

  router.put("/:id/resolve", protect, roleCheck("admin", "staff"), markResolved);

  router.put("/:id/department", protect, roleCheck("admin"), updateDepartment);


  export default router;
