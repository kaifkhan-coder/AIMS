import mongoose from "mongoose";
import { union } from "zod";

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true    
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.githubId;
    }
  },
  googleId: {
    type: String
  },
  githubId: {
    type: String
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true
  },
  // ✅ OTP & VERIFICATION
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ["admin", "staff", "user"],
    default: "user",
  },

  otp: {
    type: String
  },

  otpExpires: {
    type: Date
  },

  lastOtpSentAt: {
    type: Date
  },

  otpAttempts: {
    type: Number,
    default: 0
  },

  otpLockedUntil: {
    type: Date
  },
  department: {
  type: String,
  enum: ["IT", "Network", "Hardware", "Accounts"],
},
profilePhoto: {
    type: String,
    default: ""
  },
  lastLogin: {
    type: Date
  },
  twoFactorEnabled: { type: Boolean, default: false },
twoFactorCode: String,
twoFactorExpiry: Date,

}, { timestamps: true });

export default mongoose.model("User", userSchema);
