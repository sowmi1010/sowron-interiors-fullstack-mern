// routes/adminAuthRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
} from "../controllers/adminAuthController.js";

const router = express.Router();

/* LOGIN */
router.post("/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
}), adminLogin);

/* FORGOT PASSWORD */
router.post("/forgot-password", adminForgotPassword);

/* RESET PASSWORD */
router.post("/reset-password", adminResetPassword);

export default router;
