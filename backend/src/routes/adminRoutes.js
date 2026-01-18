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
   VALIDATIONS
=========================== */

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password required"),
];

const forgotValidation = [
  body("email").isEmail().withMessage("Valid email required"),
];

const resetValidation = [
  body("token").notEmpty().withMessage("Reset token required"),
  body("password").isLength({ min: 6 }).withMessage("New password required"),
];

/* ===========================
   AUTH ROUTES
=========================== */
router.post(
  "/login",
  adminLoginLimiter,
  loginValidation,
  validateRequest,
  adminLogin
);

router.post(
  "/forgot-password",
  forgotLimiter,
  forgotValidation,
  validateRequest,
  adminForgotPassword
);

router.post(
  "/reset-password",
  resetValidation,
  validateRequest,
  adminResetPassword
);

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
