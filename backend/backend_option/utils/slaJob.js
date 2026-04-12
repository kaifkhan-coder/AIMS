import Ticket from "../models/Ticket.js";
import Notification from "../models/notification.js";
import cron from "node-cron";

cron.schedule("*/5 * * * *", async () => {
  const now = new Date();

  const breached = await Ticket.find({
    status: { $in: ["open", "in-progress"] },
    slaDeadline: { $lt: now }
  });

  for (const ticket of breached) {
    ticket.status = "sla-breached";
    await ticket.save();

    await Notification.create({
      user: ticket.createdBy,
      message: `SLA breached for ticket: ${ticket.title}`
    });
  }

  // console.log("SLA check done");
});
setInterval(async () => {
  const now = new Date();

  await Ticket.updateMany(
    {
      status: "resolved",
      resolvedAt: { $lte: new Date(now - 24 * 60 * 60 * 1000) }
    },
    { status: "closed" }
  );
}, 60000);

