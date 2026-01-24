import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/* ================= RATE LIMIT ================= */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP attempts. Try again later.",
});

/* ================= VALIDATION ================= */
const phoneValidation = body("phone")
  .trim()
  .isLength({ min: 10, max: 10 })
  .withMessage("Valid phone number required");

const otpValidation = body("otp")
  .trim()
  .isLength({ min: 4, max: 6 })
  .withMessage("Valid OTP required");

/* ================= ROUTES ================= */
router.post(
  "/send",
  otpLimiter,
  [phoneValidation],
  validateRequest,
  sendOtp
);

router.post(
  "/verify",
  otpLimiter,
  [phoneValidation, otpValidation],
  validateRequest,
  verifyOtp
);

export default router;
