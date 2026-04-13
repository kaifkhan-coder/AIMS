import mongoose from "mongoose";
import QRCode from "qrcode";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const Incident = (await import("./models/incident.js")).default;

const tickets = await Incident.find({ qrCode: null });
console.log("Tickets found:", tickets.length);

for (const t of tickets) {
  const qrData = `https://aims-5k31.vercel.app/resolve-ticket/${t._id}`;
  const qrCode = await QRCode.toDataURL(qrData);
  
  // save() ki jagah findByIdAndUpdate use karo — validation skip hoga
  await Incident.findByIdAndUpdate(t._id, { qrCode }, { runValidators: false });
  console.log("✅ QR saved for ticket:", t.ticketId);
}

console.log("Done!");
process.exit(0);