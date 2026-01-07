import express from "express";
import {
  addFeedback,
  getFeedback,
  getSingleFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";

const router = express.Router();

/* PUBLIC */
router.get("/", getFeedback);
router.get("/:id", getSingleFeedbackById);

/* ADMIN */
router.post(
  "/add",
  protect,
  adminOnly,
  uploadCloudinary.single("photo"),
  addFeedback
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadCloudinary.single("photo"),
  updateFeedback
);

router.delete("/:id", protect, adminOnly, deleteFeedback);

export default router;
