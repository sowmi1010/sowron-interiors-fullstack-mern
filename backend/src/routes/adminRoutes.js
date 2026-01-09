import express from "express";
import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
} from "../controllers/adminAuthController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/login", adminLogin);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password", adminResetPassword);

// Protected admin route
router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default router;
