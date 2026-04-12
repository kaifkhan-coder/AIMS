import Incident from "../models/incident.js";

export const calculateSlaTime = async (priority) => {
  const now = new Date();
  let hours = 24; // default SLA 24 hours

  if (priority === "high") hours = 4;
  else if (priority === "medium") hours = 12;

  const slaDueAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return slaDueAt;
};

// Optional: periodically check SLA breaches
export const checkSlaBreaches = async () => {
  const now = new Date();
  await Incident.updateMany(
    { slaDueAt: { $lt: now }, status: { $ne: "resolved" }, slaBreached: false },
    { slaBreached: true }
  );
  console.log("SLA breaches checked");
};
