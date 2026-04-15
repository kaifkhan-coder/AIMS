import bcrypt from "bcryptjs";

export const generateHashedOTP = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);
  return { otp, hashedOTP };
};
