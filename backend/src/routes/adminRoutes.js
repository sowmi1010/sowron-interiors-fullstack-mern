import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
} from "../controllers/adminAuthController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===========================
   RATE LIMITERS
=========================== */

// Prevent brute-force admin login
const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 5, // only 5 attempts
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Prevent abuse on forgot password
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: "Too many reset requests. Try again later." },
});

/* ===========================
   AUTH ROUTES
=========================== */
router.post("/login", adminLoginLimiter, adminLogin);
router.post("/forgot-password", forgotLimiter, adminForgotPassword);
router.post("/reset-password", adminResetPassword);

/* ===========================
   PROTECTED ADMIN ROUTE
=========================== */
router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    admin: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

export default router;
