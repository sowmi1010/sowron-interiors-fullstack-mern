import express from "express";
import User from "../models/User.js";
import { userProtect } from "../middleware/userMiddleware.js";

const router = express.Router();

/* ================= UPDATE PROFILE ================= */
router.put("/update", userProtect, async (req, res) => {
  try {
    const { name, city } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (city) updates.city = city.trim();

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
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
});

/* ================= CURRENT USER ================= */
router.get("/me", userProtect, (req, res) => {
  res.json(req.user);
});

export default router;
