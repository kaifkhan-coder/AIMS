// import User from "../models/User.js";
// import { generateOtp, hashOtp, generateVerifyToken, sha256 } from "../utils/otpSecurity.js";
// import { sendMail } from "../utils/mailer.js"; // your nodemailer helper

// const OTP_TTL_MIN = 10;
// const TOKEN_TTL_MIN = 10;

// export const sendStaffOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email: email.toLowerCase().trim() });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Optional: only staff
//     if (user.role !== "staff") {
//       return res.status(403).json({ message: "Only staff verification allowed" });
//     }

//     // lock check
//     if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
//       return res.status(429).json({ message: "OTP locked. Try later." });
//     }

//     const otp = generateOtp();
//     const token = generateVerifyToken();

//     user.otpHash = await hashOtp(otp);
//     user.otpExpires = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

//     // store only HASH of token (if DB leaks, attacker can’t use token)
//     user.otpTokenHash = sha256(token);
//     user.otpTokenExpires = new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000);

//     user.otpAttempts = 0; // reset attempts
//     await user.save();

//     const link = `${process.env.FRONTEND_URL}/verify-otp?token=${token}`;

//     await sendMail({
//       to: user.email,
//       subject: "Verify Staff Account (OTP)",
//       html: `
//         <div style="font-family:Arial;padding:16px">
//           <h2>Verify Your Staff Account</h2>
//           <p>Your OTP is:</p>
//           <div style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</div>
//           <p>Expires in <b>${OTP_TTL_MIN} minutes</b>.</p>
//           <p>Open verification page:</p>
//           <a href="${link}">${link}</a>
//         </div>
//       `,
//     });

//     res.json({ message: "OTP sent to email" }); // ✅ Do NOT return token in response
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };