import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { body } from "express-validator";
import {
  sendOtp,
  verifyOtp,
  sendLoginOtpByEmail,
  verifyLoginOtpByEmail,
} from "../controllers/otpController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getFallbackIpKey = (req) => {
  const cfIp = req.headers["cf-connecting-ip"];
  const ip = typeof cfIp === "string" && cfIp.trim() ? cfIp.trim() : req.ip;
  return ipKeyGenerator(ip || "");
};

const keyByIdentityOrIp = (req) => {
  const email = normalizeText(req.body?.email);
  const phone = normalizeText(req.body?.phone);
  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `ip:${getFallbackIpKey(req)}`;
};

/* =========================
   RATE LIMITERS
========================= */
const sendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: keyByIdentityOrIp,
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: keyByIdentityOrIp,
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
