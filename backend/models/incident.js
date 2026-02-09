// models/incident.js
import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // 👈 MUST match User model name
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["General", "IT", "Network", "Hardware", "Accounts"],
      default: "General",
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },

    department: {
      type: String,
      enum: ["IT", "Network", "Hardware", "Accounts", "General"],
      default: "General",
      index: true,
    },

    status: {
      type: String,
      enum: ["Open", "Pending", "Resolved", "Closed", "In Progress"],
      default: "Open",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    attachment: {
      type: String,
      default: null,
    },

    llmMeta: {
      originalDepartment: String,
      updatedByAdmin: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);
