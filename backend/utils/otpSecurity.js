import crypto from "crypto";
import bcrypt from "bcryptjs";

export const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digit

export const hashOtp = async (otp) => bcrypt.hash(otp, 10);

export const compareOtp = async (otp, hash) => bcrypt.compare(otp, hash);

// token for link (not the OTP)
export const generateVerifyToken = () => crypto.randomBytes(32).toString("hex");

export const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");