import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  role: {type: String, enum: ["user", "staff", "admin"] },

  type: { type: String, enum: ["info", "success", "warning", "error"] },

  message: String,

  read: { type: Boolean, default: false }
  
}, {timestamps: true });

export default mongoose.model("Notification", notificationSchema);
