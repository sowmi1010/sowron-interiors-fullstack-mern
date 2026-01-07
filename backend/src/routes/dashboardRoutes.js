import express from "express";
import { getDashboardCounts } from "../controllers/adminDashboardController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/counts", protect, adminOnly, getDashboardCounts);

export default router;
