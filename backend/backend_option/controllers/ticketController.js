import Incident from "../models/incident.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
/* ===============================
   GET MY TICKETS
   GET /api/incidents/my
================================ */
export const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      createdBy: req.user._id,
    })
      .sort({ createdAt: -1 })
      .select(
        "ticketId title status priority category createdAt"
      );

    res.json(incidents);
  } catch (error) {
    console.error("GET MY INCIDENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getAssignedTickets = async (req, res) => {
//   try {
//     if (!req.user) return res.status(401).json({ message: "Unauthorized" });

//     const tickets = await Incident.find({ assignedTo: req.user._id })
//       .populate("createdBy", "username")
//       .sort({ createdAt: -1 });

//     res.json({ tickets });
//   } catch (err) {
//     console.error("GET ASSIGNED TICKETS ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getAssignedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      assignedTo: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch assigned tickets" });
  }
};

