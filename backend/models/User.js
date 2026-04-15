import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId;
      },
    },
    googleId: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "staff", "user", "super_admin"],
      default: "user",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    lastOtpSentAt: {
      type: Date,
      default: null,
    },
    otpHash: {
      type: String,
      default: null,
    },
    otpTokenHash: {
      type: String,
      default: null,
    },
    otpTokenExpires: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLockedUntil: {
      type: Date,
      default: null,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    workLoadLimit: {
      type: Number,
      default: 20,
    },
    department: {
      type: String,
      enum: ["IT", "Network", "Hardware", "Accounts", "General", "Security", "Software"],
      default: null,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    blockReason: {
      type: String,
      default: "",
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rootCause: {
      type: String,
      default: "",
    },
    suggestedRootCause: {
      type: String,
      default: "",
    },
    resolutionSummary: {
      type: String,
      default: "",
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
failedLoginAttempts: {
  type: Number,
  default: 0,
},
loginLockUntil: {
  type: Date,
  default: null,
},
qrCode: String, // New field for QR code data URL
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);