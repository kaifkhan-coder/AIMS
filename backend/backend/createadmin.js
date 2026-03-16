import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js"; // adjust path if needed

async function createAdmin() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/aims_db");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      full_name: "Admin One",
      email: "khan.kaif.new@gmail.com",
      username: "admin1",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created:", admin);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
