import rateLimit from "express-rate-limit";

/* ================= OTP LIMITER =================
   Very strict – prevents brute force
================================================ */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP attempts. Try again later.",
  },
});

/* ================= PUBLIC FORM LIMITER =================
   Enquiry / Contact / Feedback
======================================================== */
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // reasonable public usage
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many form submissions. Please try again later.",
  },
});

/* ================= ADMIN LOGIN LIMITER =================
   Extra protection for admin auth
======================================================== */
export const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});
