import mongoose from "mongoose";

const roleRequestSchema = new mongoose.Schema(
  {
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    requestedRole: {
      type: String,
      enum: ["admin", "staff", "user"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reason: { type: String, default: "" },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("RoleRequest", roleRequestSchema);