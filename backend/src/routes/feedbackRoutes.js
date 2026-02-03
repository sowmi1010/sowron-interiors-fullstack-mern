import express from "express";
import {
  addFeedback,
  getFeedback,
  getSingleFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";

import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", getFeedback);
router.get("/:id", getSingleFeedbackById);

/* ================= ADMIN ================= */
router.post(
  "/add",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  getUploader("sowron-interiors/feedback").single("photo"),
  addFeedback
);

router.put(
  "/:id",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  getUploader("sowron-interiors/feedback").single("photo"),
  updateFeedback
);

router.delete(
  "/:id",
  adminProtect,
  adminIpWhitelist,
  adminAudit,
  deleteFeedback
);

export default router;
