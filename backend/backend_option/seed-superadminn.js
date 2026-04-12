// seed-superadminn.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.log("❌ MONGO_URI is missing in backend/.env");
  process.exit(1);
}

function requiredEnv(key) {
  const v = process.env[key];
  if (!v) {
    console.log(`❌ Missing ${key} in .env`);
    process.exit(1);
  }
  return v;
}

const full_name = requiredEnv("SUPERADMIN_NAME");
const email = requiredEnv("SUPERADMIN_EMAIL");
const plainPassword = requiredEnv("SUPERADMIN_PASSWORD");

// ✅ username is required by your schema
// Put this in .env too for control, else auto-generate:
const username = (process.env.SUPERADMIN_USERNAME || "superadmin").toLowerCase();

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // ✅ Your enum is "super_admin" (lowercase)
    const exists = await User.findOne({ role: "super_admin" });
    if (exists) {
      console.log("⚠️ Super Admin already exists:", exists.email);
      process.exit(0);
    }

    // ✅ Prevent duplicates by email/username too
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      console.log("❌ Email already exists. Use different SUPERADMIN_EMAIL.");
      process.exit(1);
    }

    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      console.log("❌ Username already exists. Change SUPERADMIN_USERNAME.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await User.create({
      full_name,
      username,
      email,
      password: hashedPassword,     // ✅ schema expects "password"
      role: "super_admin",          // ✅ valid enum value
      isVerified: true,             // ✅ optional but good
      isActive: true,
      twoFactorEnabled: false,
      department: "IT",             // optional (must be one of your enum values)
      profilePhoto: "",
    });

    console.log("🎉 Super Admin created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();