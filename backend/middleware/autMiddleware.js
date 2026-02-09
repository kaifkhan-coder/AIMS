import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Fetch real user from DB
    const user = await User.findById(decoded.id || decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

req.user = {
  _id: user._id,
  full_name: user.full_name,
  email: user.email,
  username: user.username,
  role: user.role,
  department: user.department,
  profilePhoto: user.profilePhoto
};
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};


/* ---------------- ROLE CHECK (OPTIONAL) ---------------- */
export const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(", ")}`
      });
    }

    next();
  };
};
