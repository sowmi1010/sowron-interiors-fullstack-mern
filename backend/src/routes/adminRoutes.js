import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";

import {
  adminLogin,
  adminVerifyOtp,
  adminForgotPassword,
  adminResetPassword,
  adminLogout,
} from "../controllers/adminAuthController.js";

import { validateRequest } from "../middleware/validateRequest.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";
import { adminProtect } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

/* ================= RATE LIMIT ================= */
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
});

/* ================= VALIDATION ================= */
router.post(
  "/login",
  adminIpWhitelist,
  loginLimiter,
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validateRequest,
  adminLogin
);

router.post(
  "/verify-otp",
  adminIpWhitelist,
  loginLimiter,
  [body("email").isEmail(), body("otp").isLength({ min: 6, max: 6 })],
  validateRequest,
  adminVerifyOtp
);

router.post(
  "/forgot-password",
  adminIpWhitelist,
  forgotLimiter,
  [body("email").isEmail()],
  validateRequest,
  adminForgotPassword
);

router.post(
  "/reset-password",
  adminIpWhitelist,
  [
    body("token").notEmpty(),
    body("password").isLength({ min: 8 }),
  ],
  validateRequest,
  adminResetPassword
);

/* ================= DASHBOARD ================= */
router.get(
  "/dashboard",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
      admin: {
        id: req.admin._id,
        email: req.admin.email,
      },
    });
  }
);

router.get("/session", adminProtect, adminIpWhitelist, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
});

router.post(
  "/logout",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  adminLogout
);

export default router;
