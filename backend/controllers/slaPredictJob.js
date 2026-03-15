import Incident from "../models/incident.js";
import Notification from "../models/notification.js";

const SLA_RULES = {
  Critical: { resolveMinutes: 60 },
  High: { resolveMinutes: 120 },
  Medium: { resolveMinutes: 360 },
  Low: { resolveMinutes: 1440 },
};

const statusOpen = new Set(["Open", "In Progress", "Pending"]);

export const runSlaPredictor = async (io) => {
  const now = Date.now();

  const openTickets = await Incident.find({
    status: { $in: Array.from(statusOpen) },
  }).select("_id ticketId createdAt priority status lastSlaAlertAt slaStatus assignedTo");

  for (const t of openTickets) {
    const rule = SLA_RULES[t.priority] || SLA_RULES.Low;
    const usedMin = (now - new Date(t.createdAt).getTime()) / 60000;
    const pct = usedMin / rule.resolveMinutes;

    let newStatus = "ON_TRACK";
    if (pct >= 1) newStatus = "BREACHED";
    else if (pct >= 0.9) newStatus = "CRITICAL";
    else if (pct >= 0.7) newStatus = "WARNING";

    // spam guard (30 min)
    const last = t.lastSlaAlertAt ? new Date(t.lastSlaAlertAt).getTime() : 0;
    const canAlert = now - last > 30 * 60 * 1000;

    // save slaStatus change
    if (newStatus !== t.slaStatus) {
      t.slaStatus = newStatus;
      await t.save();
    }

    // Only alert WARNING/CRITICAL/BREACHED
    if (newStatus !== "ON_TRACK" && canAlert) {
      t.lastSlaAlertAt = new Date();
      await t.save();

      const msg =
        newStatus === "BREACHED"
          ? `🚨 SLA Breached: ${t.ticketId}`
          : `⚠️ SLA Risk (${newStatus}): ${t.ticketId}`;

      const type =
        newStatus === "BREACHED" ? "error" : "warning"; // matches your schema enum

      // ✅ DO NOT notify user here (REMOVED)

      // ✅ notify staff if assigned
      if (t.assignedTo) {
        await Notification.create({
          user: t.assignedTo,
          role: "staff",
          type,
          message: msg,
        });
      }

      // ✅ notify admins (role broadcast)
      await Notification.create({
        role: "admin",
        type,
        message: msg,
      });

      // realtime socket
      if (io) {
        io.to("admin").emit("sla_alert", { ticketId: t.ticketId, status: newStatus });
        if (t.assignedTo) io.to(String(t.assignedTo)).emit("sla_alert", { ticketId: t.ticketId, status: newStatus });
      }
    }
  }
};