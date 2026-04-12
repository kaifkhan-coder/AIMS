// import mongoose from "mongoose";

// const auditSchema = new mongoose.Schema({
//   incidentId: mongoose.Schema.Types.ObjectId,
//   originalDepartment: String,
//   updatedDepartment: String,
//   updatedBy: mongoose.Schema.Types.ObjectId,
//   updatedAt: { type: Date, default: Date.now },
//   action: {
//     type: String,
//     // enum: ["auto-reassign", "manual-reassign", "status-change", "priority-change"],
//     required: true,
//   },
//   actor: {
//     type : mongoose.Schema.Types.ObjectId, ref: "User", 
//   },
//   targetUser: {
//     type : mongoose.Schema.Types.ObjectId, ref: "User",
//   },
//   details: {
//     type: Object, default: {}
//   }, 
// });

// export default mongoose.model("AuditLog", auditSchema);

import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    originalDepartment: {
      type: String,
      default: "",
    },
    updatedDepartment: {
      type: String,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);