import express from "express";
import User from "../models/User.js";
import { userProtect } from "../middleware/userMiddleware.js";

const router = express.Router();

/* ================= UPDATE PROFILE ================= */
router.put("/update", userProtect, async (req, res) => {
  try {
    const { name, city, email } = req.body;

    const updates = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof city === "string" && city.trim()) updates.city = city.trim();
    if (typeof email === "string" && email.trim()) {
      updates.email = email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }

    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

/* ================= CURRENT USER ================= */
router.get("/me", userProtect, (req, res) => {
  res.json(req.user);
});

export default router;
