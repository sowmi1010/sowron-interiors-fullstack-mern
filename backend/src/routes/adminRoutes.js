import express from "express";
import { adminLogin } from "../controllers/adminAuthController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try later."
});

router.post("/login", adminLoginLimiter, adminLogin);

export default router;
