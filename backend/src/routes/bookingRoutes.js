import express from "express";
import {
  addBooking,
  getBookings,
  updateStatus,
  getBlockedSlots,
  getBookingStats,
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* 🟢 PUBLIC */
router.get("/blocked-slots", getBlockedSlots);
router.post("/add", protect, addBooking);

/* 🔐 ADMIN */
router.use(protect, adminOnly);
router.get("/", getBookings);
router.get("/stats", getBookingStats);
router.patch("/status/:id", updateStatus);

export default router;
