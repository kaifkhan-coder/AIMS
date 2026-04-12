// routes/bootstrap.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

/**
 * POST /api/bootstrap/super-admin
 * Works only if there is NO super admin already.
 */
router.post("/super-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    // ✅ Restriction: allow only once
    const existingSuper = await User.findOne({ role: "SUPER_ADMIN" });
    if (existingSuper) {
      return res.status(403).json({ message: "Super Admin already exists. Bootstrap disabled." });
    }

    // ✅ Strong password basic rule (add more if you want)
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const superAdmin = await User.create({
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      mfaEnabled: false, // later you can enforce MFA after first login
    });

    return res.status(201).json({
      message: "Super Admin created successfully",
      superAdmin: { id: superAdmin._id, name: superAdmin.name, email: superAdmin.email, role: superAdmin.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;