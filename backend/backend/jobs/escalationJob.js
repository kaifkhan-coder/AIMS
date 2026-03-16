import Incident from "../models/incident.js";
import SlaRule from "../models/SlaRule.js";

export const runEscalationJob = async (io) => {
  try {
    const openIncidents = await Incident.find({
      status: { $in: ["OPEN", "IN_PROGRESS"] }
    });

    for (const incident of openIncidents) {
      const ageMin =
        (Date.now() - new Date(incident.createdAt).getTime()) / 60000;

      const sla = await SlaRule.findOne({
        severity: incident.priority || incident.severity,
        isActive: true,
      });

      if (!sla) continue;

      if (ageMin > sla.resolveMinutes && incident.escalationLevel === 0) {
        incident.escalationLevel = 1;
        incident.escalatedAt = new Date();
        incident.lastEscalationReason = "SLA breached";
        await incident.save();

        io.to("admin").emit("notification", {
          type: "warning",
          message: `Incident ${incident.title} escalated to admin`,
        });
      }
    }
  } catch (err) {
    console.error("ESCALATION JOB ERROR:", err);
  }
};