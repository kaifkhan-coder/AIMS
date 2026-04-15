import mongoose from "mongoose";
import QRCode from "qrcode";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const User = (await import("./models/User.js")).default;

const staffList = await User.find({ role: "staff" });
console.log("Staff found:", staffList.length);

for (const s of staffList) {
  const id = s._id.toString(); // ← correct MongoDB ObjectId
  console.log("ID:", id); // verify karo ye sahi hai
  const qrData = `https://aims-5k31.vercel.app/verify/${id}`;
  const qrCode = await QRCode.toDataURL(qrData);
  await User.findByIdAndUpdate(s._id, { qrCode });
  console.log("✅ QR saved for:", s.full_name, "ID:", id);
}

process.exit(0);