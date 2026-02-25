import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  incidentId: mongoose.Schema.Types.ObjectId,
  originalDepartment: String,
  updatedDepartment: String,
  updatedBy: mongoose.Schema.Types.ObjectId,
  updatedAt: { type: Date, default: Date.now },
  action: {
    type: String,
    // enum: ["auto-reassign", "manual-reassign", "status-change", "priority-change"],
    required: true,
  },
  actor: {
    type : mongoose.Schema.Types.ObjectId, ref: "User", 
  },
  targetUser: {
    type : mongoose.Schema.Types.ObjectId, ref: "User",
  },
  details: {
    type: Object, default: {}
  }, 
});

export default mongoose.model("AuditLog", auditSchema);
