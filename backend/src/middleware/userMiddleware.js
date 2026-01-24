import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const userProtect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization required" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("USER AUTH ERROR:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
