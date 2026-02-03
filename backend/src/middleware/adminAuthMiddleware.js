import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const adminProtect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const bearerToken =
      auth && auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
    const cookieToken = req.cookies?.adminToken || null;
    const token = bearerToken || cookieToken;

    if (process.env.DEBUG_AUTH === "true") {
      console.log("ADMIN AUTH DEBUG:", {
        path: req.originalUrl,
        hasBearer: Boolean(bearerToken),
        hasCookie: Boolean(cookieToken),
        cookieNames: Object.keys(req.cookies || {}),
      });
    }

    if (!token) {
      return res.status(401).json({ message: "Authorization required" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.type !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("ADMIN AUTH ERROR:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};
