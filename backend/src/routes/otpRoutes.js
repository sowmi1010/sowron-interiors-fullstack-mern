import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/* ===== RATE LIMIT ===== */
const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests",
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP attempts",
});

/* ===== VALIDATION ===== */
const phoneValidation = body("phone")
  .matches(/^[6-9]\d{9}$/)
  .withMessage("Valid phone number required");

const otpValidation = body("otp")
  .isLength({ min: 6, max: 6 })
  .withMessage("6 digit OTP required");

/* ===== ROUTES ===== */
router.post(
  "/send",
  sendLimiter,
  [phoneValidation],
  validateRequest,
  sendOtp
);

router.post(
  "/verify",
  verifyLimiter,
  [phoneValidation, otpValidation],
  validateRequest,
  verifyOtp
);

export default router;
