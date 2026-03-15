import mongoose from "mongoose";

const roleRequestSchema = new mongoose.Schema(
  {
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestedRole: { type: String, enum: ["admin"], default: "admin" },

    reason: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
      index: true,
    },

    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requesterIp: { type: String, default: "" },
    requesterUserAgent: { type: String, default: "" },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },

    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// ✅ prevent multiple pending per target user
roleRequestSchema.index(
  { targetUser: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export default mongoose.model("RoleRequest", roleRequestSchema);