import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
  sendOtp,
  verifyOtp,
  sendLoginOtpByEmail,
  verifyLoginOtpByEmail,
} from "../controllers/otpController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/* =========================
   RATE LIMITERS (CLOUDFLARE SAFE)
========================= */
const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, // ⬅️ increase
  keyGenerator: (req) =>
    req.body?.email || req.body?.phone || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});


const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                  // 5 verify attempts
  keyGenerator: (req) =>
    req.body?.email ||
    req.body?.phone ||
    req.headers["cf-connecting-ip"] ||
    req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP attempts. Please try again later.",
  },
});

/* =========================
   VALIDATIONS
========================= */
const phoneValidation = body("phone")
  .optional()
  .matches(/^[6-9]\d{9}$/)
  .withMessage("Valid phone number required");

const otpValidation = body("otp")
  .isLength({ min: 6, max: 6 })
  .withMessage("6 digit OTP required");

const emailValidation = body("email")
  .isEmail()
  .withMessage("Valid email required");

const nameValidation = body("name")
  .optional({ checkFalsy: true })
  .isLength({ min: 2 })
  .withMessage("Name too short");

/* =========================
   ROUTES
========================= */

// Send OTP (phone/email)
router.post(
  "/send",
  sendLimiter,
  [phoneValidation, emailValidation, nameValidation],
  validateRequest,
  sendOtp
);

// Verify OTP (phone/email)
router.post(
  "/verify",
  verifyLimiter,
  [phoneValidation, otpValidation, emailValidation],
  validateRequest,
  verifyOtp
);

// Send Login OTP (email)
router.post(
  "/send-login",
  sendLimiter,
  [emailValidation],
  validateRequest,
  sendLoginOtpByEmail
);

// Verify Login OTP (email)
router.post(
  "/verify-login",
  verifyLimiter,
  [emailValidation, otpValidation],
  validateRequest,
  verifyLoginOtpByEmail
);

export default router;
