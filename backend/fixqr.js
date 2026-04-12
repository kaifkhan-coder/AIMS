import mongoose from "mongoose";
import QRCode from "qrcode";
import User from "./models/User.js";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const staffList = await User.find({ role: "staff" });
console.log("Staff found:", staffList.length);

for (const s of staffList) {
  const qrData = `http://localhost:5173/verify/${s._id}`;
  const qrCode = await QRCode.toDataURL(qrData);
  await User.findByIdAndUpdate(s._id, { qrCode });
  console.log("✅ QR saved for:", s.full_name);
}

console.log("Done!");
process.exit(0);