import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    role: {
      type: String,
      enum: ["user", "staff", "admin", "super_admin"],
      default: null,
    },

    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "ticket_created", "sla_breach"],
      default: "info",
    },

    message: { type: String, required: true },

    read: { type: Boolean, default: false },

    // ✅ NEW: hide role notifications only for that user
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);