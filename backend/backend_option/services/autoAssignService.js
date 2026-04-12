import User from "../models/User.js";
import Incident from "../models/Ticketmodel.js";

export const autoAssignIncident = async (incident) => {
  const staffList = await User.find({ 
    role: "staff", 
    department: incident.department 
  });

  if (staffList.length === 0) return null;

  // Count incidents per staff
  let selectedStaff = null;
  let minLoad = Infinity;

  for (const staff of staffList) {
    const count = await Incident.countDocuments({
      assignedTo: staff._id,
      status: { $ne: "closed" }
    });

    if (count < minLoad) {
      minLoad = count;
      selectedStaff = staff;
    }
  }

  return selectedStaff;
};
