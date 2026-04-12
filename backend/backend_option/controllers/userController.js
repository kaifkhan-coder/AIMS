import Incident from "../models/incident.js";
import multer from "multer";

export const STATUS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
  RESOLVED: "Resolved",
  PENDING: "Pending",
};
export const getTicketStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Incident.countDocuments({ createdBy: userId });

    const open = await Incident.countDocuments({
      createdBy: userId,
      status: STATUS.OPEN,
    });

    const inProgress = await Incident.countDocuments({
      createdBy: userId,
      status: STATUS.IN_PROGRESS,
    });

    const closed = await Incident.countDocuments({
      createdBy: userId,
      status: STATUS.CLOSED,
    });

    res.json({
      total,
      open,
      inProgress,
      closed,
    });
  } catch (error) {
    console.error("TICKET STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
