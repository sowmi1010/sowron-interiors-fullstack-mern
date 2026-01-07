// routes/otpRoutes.js
import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { otpLimiter } from "../middleware/otpRateLimit.js";

const router = express.Router();

router.post("/send", otpLimiter, sendOtp);
router.post("/verify", verifyOtp);

export default router;
