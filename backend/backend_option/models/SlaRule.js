import mongoose from "mongoose";

const slaRuleSchema = new mongoose.Schema(
  {
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
      unique: true,
    },
    responseMinutes: { type: Number, required: true, min: 1 },
    resolveMinutes: { type: Number, required: true, min: 1 },

    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("SlaRule", slaRuleSchema);