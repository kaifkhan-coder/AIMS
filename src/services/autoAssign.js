import User from "../models/User.js";

export const autoAssignStaff = async (department) => {
  return await User.findOne({ role: "staff", department });
};

const staff = {
  Network: "Network Engineer",
  Hardware: "Hardware Technician",
  Software: "Software Support",
  Security: "Security Admin",
  Admin: "Office Admin"
};

const result = await classifyIncident(ticket.description);

ticket.department = result.department;
ticket.assignedTo = staff[result.department];
ticket.confidence = result.confidence;
return ticket;
