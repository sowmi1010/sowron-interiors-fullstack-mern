import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

/* ===========================
   OTP RATE LIMIT
=========================== */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per IP
  message: "Too many OTP requests. Try again later.",
});

/* ===========================
   VALIDATIONS
=========================== */
const sendOtpValidation = [
  body("phone")
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage("Valid phone number required"),
];

const verifyOtpValidation = [
  body("phone")
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage("Valid phone number required"),
  body("otp")
    .trim()
    .isLength({ min: 4, max: 6 })
    .withMessage("Valid OTP required"),
];

/* ===========================
   ROUTES
=========================== */
router.post("/send", otpLimiter, sendOtpValidation, validateRequest, sendOtp);
router.post("/verify", otpLimiter, verifyOtpValidation, validateRequest, verifyOtp);

export default router;
