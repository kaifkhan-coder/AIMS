export const getStaffProfile = async (req, res) => {
  try {
    const staffId = req.user.id;

    const tickets = await Incident.find({ assignedTo: staffId });

    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === "open").length,
      inProgress: tickets.filter(t => t.status === "in_progress").length,
      resolved: tickets.filter(t => t.status === "resolved").length,
    };

    res.json({
      staff: req.user,
      stats,
      recentTickets: tickets.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};