import express from "express";
import {
  addFeedback,
  getFeedback,
  getSingleFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";

const router = express.Router();

/* 🌍 PUBLIC */
router.get("/", getFeedback);
router.get("/:id", getSingleFeedbackById);

/* 🔐 ADMIN */
router.post(
  "/add",
  protect,
  adminOnly,
  getUploader("sowron-interiors/feedback").single("photo"),
  addFeedback
);

router.put(
  "/:id",
  protect,
  adminOnly,
  getUploader("sowron-interiors/feedback").single("photo"),
  updateFeedback
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteFeedback
);

export default router;
