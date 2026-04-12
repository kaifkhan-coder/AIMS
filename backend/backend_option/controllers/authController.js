import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// export const login = async (req, res) => {

//   const { username, password } = req.body;

//   const user = await User.findOne({ username });
//   if (!user) return res.status(401).json({ message: "Invalid credentials" });

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.status(401).json({ message: "Invalid credentials" });

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     "SECRET_KEY",
//     { expiresIn: "1d" }
//   );

//   res.json({
//     token,
//     role: user.role
//   });
// };
// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password required" });
//     }

//     const user = await User.findOne({ username });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     res.json({
//       user: {
//         id: user._id,
//         username: user.username,
//         role: user.role
//       }
//     });

//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

export const verifyAdminOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (
    user.twoFactorOTP !== otp ||
    user.twoFactorExpiry < Date.now()
  ) {
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  user.twoFactorOTP = null;
  user.twoFactorExpiry = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, user });
};
export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ message: "Invalid request" });

  if (
    user.twoFactorCode !== otp ||
    user.twoFactorExpiry < Date.now()
  ) {
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  // Clear OTP
  user.twoFactorCode = null;
  user.twoFactorExpiry = null;
  await user.save();

  const token = generateToken(user);

  res.json({
    token,
    user,
  });
};

// export const verifyAdminOTP = async (req, res) => {
//   try {
//     const { userId, otp } = req.body;    
//     const user = await User.find
//       .findById(userId)
//       .select("+twoFactorOTP +twoFactorExpiry"); 
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.twoFactorOTP !== otp || user.twoFactorExpiry < Date.now()) {
//       return res.status(401).json({ message: "Invalid or expired OTP" });
//     }
//     user.twoFactorOTP = null;
//     user.twoFactorExpiry = null;
//     await user.save();
//     res.json({ message: "OTP verified", user });
//   } catch (err) {
//     console.error("VERIFY OTP ERROR:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
