import express from "express";
import Ticket from "../models/incident.js";
import { protect } from "../middleware/autMiddleware.js";
import { upload } from "../middleware/upload.js";
import User from "../models/User.js";
import { getAssignedTickets } from "../controllers/ticketController.js";
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      createdBy: req.user.id   // 🔥 THIS IS THE KEY
    })
    .sort({createdAt: -1});

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= CREATE TICKET ================= */
router.post(
  "/",
  protect,
  upload.single("attachment"),
  async (req, res) => {
    try {
      const io = req.app.get("io");

      const staff = await User.findOne({
        role: "staff",
        department: req.body.department,
        isVerified: true,
      });

      const ticket = await Ticket.create({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        department: req.body.department,
        createdBy: req.user._id,
        attachment: req.file?.filename,
        assignedTo: staff?._id || null,
        status: "open",
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

// 🔔 USER (only once)
io.to(req.user.id).emit("notification", {
  type: "success",
  message: "🎫 Ticket submitted successfully",
  ticketId: ticket._id,
});

// 🔔 ADMIN
io.to("admin").emit("notification", {
  type: "info",
  message: `🆕 New ticket created (${ticket.department})`,
  ticketId: ticket._id,
});

// 🔔 STAFF (only if assigned)
if (staff) {
  io.to("staff").emit("notification", {
    type: "info",
    message: `📌 Ticket assigned to ${ticket.department}`,
    ticketId: ticket._id,
  });
}

      res.json(ticket);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ticket creation failed" });
    }
  }
);

// export const createTicket = async (req, res) => {
//   try {
//     const ticket = await Ticket.create({
//       ...req.body,
//       user: req.user.id,
//     });

//     const io = req.app.get("io");

//     // 🔔 USER notification
//     io.to(req.user.id).emit("notification", {
//       type: "success",
//       message: "🎫 Your ticket has been created successfully",
//     });

//     // 🔔 STAFF notification
//     io.to("staff").emit("notification", {
//       type: "info",
//       message: `🆕 New ticket raised by ${req.user.username}`,
//       ticketId: ticket._id,
//     });

//     // 🔔 ADMIN notification
//     io.to("admin").emit("notification", {
//       type: "warning",
//       message: "🚨 New ticket requires attention",
//       ticketId: ticket._id,
//     });

//     res.status(201).json(ticket);
//   } catch (err) {
//     res.status(500).json({ message: "Ticket creation failed" });
//   }
// };

router.get("/department", protect, async (req, res) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied" });
  }

  const tickets = await Ticket.find({
    assignedTo: req.user._id
  });

  res.json(tickets);
});

router.get("/all", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  const tickets = await Ticket.find()
    .populate("createdBy", "username email");

  res.json(tickets);
});


router.get("/assigned", protect, getAssignedTickets);

router.get("/my", protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to load tickets" });
  }
});

router.get("/:id", protect, async (req, res) => {
  console.log("STATUS RECEIVED:", req.body.status);
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "username role")
      .populate("assignedTo", "username role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to load ticket" });
  }
});

router.post("/:id/comment", protect, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Comment required" });
  }

  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.comments.push({
      message,
      user: req.user._id,
      role: req.user.role,
    });

    await ticket.save();

    res.json({ message: "Comment added", comments: ticket.comments });
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const io = req.app.get("io");
    const { status } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = status;
    await ticket.save();

    if (status === "resolved") {
      io.to(`user_${ticket.createdBy}`).emit("ticket_resolved", {
        message: "Your ticket has been resolved",
        ticketId: ticket._id,
      });

      io.to("admin").emit("ticket_resolved", {
        message: "Ticket resolved",
        ticketId: ticket._id,
      });
    }

    res.json({ message: "Status updated", ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});


export default router;