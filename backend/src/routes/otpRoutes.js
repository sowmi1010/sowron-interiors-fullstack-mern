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

const emailValidation = body("email")
  .isEmail()
  .withMessage("Valid email required");

const nameValidation = body("name")
  .optional({ checkFalsy: true })
  .isLength({ min: 2 })
  .withMessage("Name too short");

/* ===== ROUTES ===== */
router.post(
  "/send",
  sendLimiter,
  [phoneValidation, emailValidation, nameValidation],
  validateRequest,
  sendOtp
);

router.post(
  "/verify",
  verifyLimiter,
  [phoneValidation, otpValidation, emailValidation],
  validateRequest,
  verifyOtp
);

router.post(
  "/send-login",
  sendLimiter,
  [emailValidation],
  validateRequest,
  sendLoginOtpByEmail
);

router.post(
  "/verify-login",
  verifyLimiter,
  [emailValidation, otpValidation],
  validateRequest,
  verifyLoginOtpByEmail
);

export default router;
