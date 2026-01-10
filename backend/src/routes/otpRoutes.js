// routes/otpRoutes.js
import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

/* ===========================
   OTP RATE LIMITER
=========================== */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 OTP requests per phone/IP
  message: {
    message: "Too many OTP requests. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ===========================
   OTP VERIFY LIMITER
=========================== */
const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, // prevent brute-force
  message: {
    message: "Too many OTP attempts. Please try again later.",
  },
});

/* ===========================
   ROUTES
=========================== */
router.post("/send", otpLimiter, sendOtp);
router.post("/verify", verifyLimiter, verifyOtp);

export default router;
