// import mongoose from "mongoose";
// import QRCode from "qrcode";
// import User from "./models/User.js";
// import dotenv from "dotenv";
// dotenv.config();

// await mongoose.connect(process.env.MONGO_URI);

// const staffList = await User.find({ role: "staff" });
// console.log("Staff found:", staffList.length);

// for (const s of staffList) {
//   const qrData = `http://localhost:5173/verify/${s._id}`;
//   const qrCode = await QRCode.toDataURL(qrData);
//   await User.findByIdAndUpdate(s._id, { qrCode });
//   console.log("✅ QR saved for:", s.full_name);
// }

// console.log("Done!");
// process.exit(0);

import mongoose from "mongoose";
import QRCode from "qrcode";
import dotenv from "dotenv";
dotenv.config();

// Apna Atlas URI paste karo
await mongoose.connect("mongodb+srv://khankaifcom551:Khan123Kaif@cluster0.6elaksp.mongodb.net/aims2");

const User = (await import("./models/User.js")).default;

const staffList = await User.find({ role: "staff" });
console.log("Staff found:", staffList.length);

for (const s of staffList) {
  const qrData = `https://aims-5k31.vercel.app/verify/${s._id}`;
  const qrCode = await QRCode.toDataURL(qrData);
  await User.findByIdAndUpdate(s._id, { qrCode });
  console.log("✅ QR saved for:", s.full_name);
}

process.exit(0);