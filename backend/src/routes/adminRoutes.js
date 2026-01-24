import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";

import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
} from "../controllers/adminAuthController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/* ================= RATE LIMIT ================= */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
});

/* ================= VALIDATION ================= */
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validateRequest,
  adminLogin
);

router.post(
  "/forgot-password",
  forgotLimiter,
  [body("email").isEmail()],
  validateRequest,
  adminForgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty(),
    body("password").isLength({ min: 8 }),
  ],
  validateRequest,
  adminResetPassword
);

/* ================= DASHBOARD ================= */
router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    admin: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
