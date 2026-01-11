import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

/* ===========================
   SEND OTP LIMITER
=========================== */
const sendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // allow 10 OTP per IP
  message: {
    message: "Too many OTP requests. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===========================
   VERIFY OTP LIMITER
=========================== */
const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    message: "Too many OTP attempts. Please try again later.",
  },
});

/* ===========================
   ROUTES
=========================== */
router.post("/send", sendOtpLimiter, sendOtp);
router.post("/verify", verifyOtpLimiter, verifyOtp);

export default router;
