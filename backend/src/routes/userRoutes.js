import express from "express";
import User from "../models/User.js";
import { userProtect } from "../middleware/userMiddleware.js";

const router = express.Router();

router.put("/update", userProtect, async (req, res) => {
  const { name, city } = req.body;

  await User.findByIdAndUpdate(req.user._id, { name, city });
  res.json({ success: true });
});

router.get("/me", userProtect, async (req, res) => {
  res.json(req.user);
});

export default router;
