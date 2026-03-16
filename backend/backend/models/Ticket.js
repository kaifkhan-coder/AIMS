import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  department: String,
  
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed", "sla-breached"],
    default: "open"
  },
  resolvedAt: Date,
  ticketId: {
  type: String,
  unique: true,
  default: () => `TKT-${Date.now()}`
},
createdAt: {
  type: Date,
  default: Date.now
},
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  attachment: String,

  slaHours: { type: Number, default: 24 },
  slaDeadline: Date,

  comments: [commentSchema]
}, { timestamps: true });     

export default mongoose.model("Ticket", ticketSchema);
