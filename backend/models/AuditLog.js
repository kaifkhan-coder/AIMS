import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  incidentId: mongoose.Schema.Types.ObjectId,
  originalDepartment: String,
  updatedDepartment: String,
  updatedBy: mongoose.Schema.Types.ObjectId,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("AuditLog", auditSchema);
