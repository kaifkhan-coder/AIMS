import mongoose from "mongoose";
const staffSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String
  },
  role: {
    type: String,
    enum: ["staff"],
    default: "user"
  },
  isVerified: {
  type: Boolean,
  default: false
},
 lastOtpSentAt: Date,
    otpAttempts: { type: Number, default: 0 },
otpLockedUntil: Date
});

export default mongoose.model("Staff", staffSchema);