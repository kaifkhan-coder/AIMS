import Incident from "../models/incident.js";

export const checkSlaBreach = async (io) => {
  const breached = await Incident.find({
    slaDueAt: { $lt: new Date() },
    status: { $ne: "closed" }
  });

  breached.forEach((incident) => {
    io.to(incident.createdBy.toString()).emit("notification", {
      message: "⏰ SLA breached for your incident",
      incidentId: incident._id
    });
  });
};
