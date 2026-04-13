import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    aiPriority: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String,
      default: null,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "staff", "user", "super_admin"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    fingerprint: {
      type: String,
      index: true,
      default: null,
    },

    normalizedText: {
      type: String,
      default: null,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      default: null,
    },

    slaStatus: {
      type: String,
      enum: ["ON_TRACK", "WARNING", "CRITICAL", "BREACHED"],
      default: "ON_TRACK",
    },

    lastslaAlertAt: {
      type: Date,
      default: null,
    },

    category: {
      type: String,
      enum: ["General", "IT", "Network", "Hardware", "Accounts"],
      default: "General",
      required: true,
    },

    proof: {
      type: String,
      enum: ["IMAGE", "SCREENSHOT", "FILE", "NONE"],
      default: "NONE",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    department: {
      type: String,
      enum: ["IT", "Network", "Hardware", "Accounts", "General", "Security", "Software"],
      default: "General",
      index: true,
    },

    status: {
      type: String,
      enum: ["Open", "Pending", "Resolved", "Closed", "In Progress", "Reopened"],
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
  filename: { type: String, default: null },
  originalName: { type: String, default: null },
  mimeType: { type: String, default: null },
  size: { type: Number, default: 0 },
},
    reopenCount: {
      type: Number,
      default: 0,
    },

    reopenedAt: {
      type: Date,
      default: null,
    },

    reopenReason: {
      type: String,
      default: "",
    },

    llmMeta: {
      originalDepartment: {
        type: String,
        default: "",
      },
      updatedByAdmin: {
        type: Boolean,
        default: false,
      },
    },

    escalationLevel: {
      type: Number,
      default: 0,
    },

    escalatedAt: {
      type: Date,
      default: null,
    },

    lastEscalationReason: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "USER",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        default: "",
        trim: true,
      },
      resolvedCompletely: {
        type: String,
        default: "",
      },
      responseSpeed: {
        type: String,
        default: "",
      },
      staffBehavior: {
        type: String,
        default: "",
      },
      recommendSupport: {
        type: String,
        default: "",
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);