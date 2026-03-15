import AccountAppeal from "../models/AccountAppeal.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

export const submitAppeal = async (req, res) => {
  try {
    const { username, message } = req.body;

    if (!username || !message) {
      return res.status(400).json({ message: "Username and message are required" });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isActive !== false) {
      return res.status(400).json({ message: "Your account is not blocked" });
    }

    const existingPending = await AccountAppeal.findOne({
      user: user._id,
      status: "Pending",
    });

    if (existingPending) {
      return res.status(409).json({ message: "You already have a pending appeal" });
    }

    const appeal = await AccountAppeal.create({
      user: user._id,
      blockReasonSnapshot: user.blockReason || "",
      userMessage: message,
    });

    await AuditLog.create({
      action: "ACCOUNT_APPEAL_SUBMITTED",
      actor: user._id,
      targetUser: user._id,
      details: { appealId: appeal._id },
    });

    res.status(201).json({
      message: "Appeal submitted successfully",
      appeal,
    });
  } catch (err) {
    console.error("SUBMIT APPEAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAppeals = async (req, res) => {
  try {
    const appeals = await AccountAppeal.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(appeals);
  } catch (err) {
    console.error("GET MY APPEALS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAppeals = async (req, res) => {
  try {
    const appeals = await AccountAppeal.find()
      .populate("user", "full_name username email isActive blockReason")
      .populate("reviewedBy", "full_name username")
      .sort({ createdAt: -1 });

    res.json(appeals);
  } catch (err) {
    console.error("GET ALL APPEALS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const reviewAppeal = async (req, res) => {
  try {
    const { status, adminReply = "" } = req.body;

    if (!["Reviewed", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appeal = await AccountAppeal.findById(req.params.id).populate("user");
    if (!appeal) return res.status(404).json({ message: "Appeal not found" });

    appeal.status = status;
    appeal.adminReply = adminReply;
    appeal.reviewedBy = req.user._id;
    appeal.reviewedAt = new Date();
    await appeal.save();

    if (status === "Approved") {
      const user = await User.findById(appeal.user._id);
      if (user) {
        user.isActive = true;
        user.blockReason = "";
        user.blockedAt = null;
        user.blockedBy = null;
        await user.save();
      }
    }

    await AuditLog.create({
      action: "ACCOUNT_APPEAL_REVIEWED",
      actor: req.user._id,
      targetUser: appeal.user._id,
      details: { appealId: appeal._id, status, adminReply },
    });

    res.json({
      message: "Appeal reviewed successfully",
      appeal,
    });
  } catch (err) {
    console.error("REVIEW APPEAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};