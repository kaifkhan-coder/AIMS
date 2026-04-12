import cron from "node-cron";
import Incident from "../models/incident.js";

cron.schedule("*/10 * * * *", async () => {
  const now = new Date();
  await Incident.updateMany(
    { slaDueAt: { $lt: now }, status: "Open" },
    { status: "SLA Breached" }
  );
});
