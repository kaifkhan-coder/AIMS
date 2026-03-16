import cron from "node-cron";
import Incident from "../models/incident.js";
import Notification from "../models/notification.js";
import { INCIDENT_STATUS } from "../controllers/incidentController.js";

export const startAutoCloseJob = () => {
  cron.schedule("0 * * * *", async () => {
    // runs every hour
    try {
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

      const now = new Date();

      const incidents = await Incident.find({
        status: INCIDENT_STATUS.RESOLVED,
        resolvedAt: { $ne: null }
      });

      for (let incident of incidents) {
        const diff = now - incident.resolvedAt;

        if (diff >= THREE_DAYS) {
          incident.status = INCIDENT_STATUS.CLOSED;
          incident.closedAt = new Date();
          await incident.save();

          await Notification.create({
            user: incident.createdBy,
            role: "user",
            message: `Your ticket ${incident.ticketId} has been auto-closed.`,
          });
        }
      }

      console.log("✅ Auto-close job executed");
    } catch (err) {
      console.error("AUTO CLOSE ERROR:", err);
    }
  });
};
