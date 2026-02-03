import express from "express";
import {
  addBooking,
  getBookings,
  updateStatus,
  getBlockedSlots,
  getBookingStats,
  deleteBooking,
} from "../controllers/bookingController.js";

import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/blocked-slots", getBlockedSlots);
router.post("/add", protect, addBooking);

/* ================= ADMIN ================= */
router.use(adminProtect, adminIpWhitelist, adminAudit);

router.get("/", getBookings);
router.get("/stats", getBookingStats);
router.patch("/status/:id", updateStatus);
router.delete("/:id", deleteBooking);

export default router;
