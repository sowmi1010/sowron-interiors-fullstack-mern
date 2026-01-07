import express from "express";
import {
  addEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
} from "../controllers/enquiryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { publicFormLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

/* 🟢 PUBLIC */
router.post("/add", publicFormLimiter, addEnquiry);

/* 🔐 ADMIN */
router.use(protect, adminOnly);

router.get("/", getEnquiries);
router.patch("/:id", updateEnquiry);
router.delete("/:id", deleteEnquiry);

export default router;
