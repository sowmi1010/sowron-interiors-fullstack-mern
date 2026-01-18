import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ===========================
   JWT PROTECT MIDDLEWARE
=========================== */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }

    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

/* ===========================
   ROLE BASED ACCESS
=========================== */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

/* ===========================
   ADMIN ONLY (Shortcut)
=========================== */
export const adminOnly = authorizeRoles("admin");
