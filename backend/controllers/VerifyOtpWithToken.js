// import User from "../models/User.js";
// import { sha256, compareOtp } from "../utils/otpSecurity.js";

// const MAX_ATTEMPTS = 5;
// const LOCK_MIN = 15;

// export const verifyOtpWithToken = async (req, res) => {
//   try {
//     const { token, otp } = req.body;
//     if (!token || !otp) return res.status(400).json({ message: "Token and OTP required" });

//     const tokenHash = sha256(token);

//     const user = await User.findOne({
//       otpTokenHash: tokenHash,
//       otpTokenExpires: { $gt: new Date() },
//     });

//     if (!user) return res.status(400).json({ message: "Invalid or expired token" });

//     if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
//       return res.status(429).json({ message: "Too many attempts. Try later." });
//     }

//     if (!user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
//       return res.status(400).json({ message: "OTP expired. Request new OTP." });
//     }

//     const ok = await compareOtp(String(otp).trim(), user.otpHash);

//     if (!ok) {
//       user.otpAttempts = (user.otpAttempts || 0) + 1;

//       if (user.otpAttempts >= MAX_ATTEMPTS) {
//         user.otpLockedUntil = new Date(Date.now() + LOCK_MIN * 60 * 1000);
//       }
//       await user.save();

//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // ✅ success
//     user.isVerified = true;

//     // clear otp fields
//     user.otpHash = undefined;
//     user.otpExpires = undefined;
//     user.otpTokenHash = undefined;
//     user.otpTokenExpires = undefined;
//     user.otpAttempts = 0;
//     user.otpLockedUntil = undefined;

//     await user.save();

//     res.json({ message: "Verified successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };