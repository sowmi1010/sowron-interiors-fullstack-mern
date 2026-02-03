import express from "express";
import { getEstimateUploader } from "../utils/uploadCloudinary.js";

import {
  addEstimate,
  getEstimates,
  updateEstimate,
  deleteEstimate,
  addEstimateNote,
} from "../controllers/estimateController.js";

import { adminProtect } from "../middleware/adminAuthMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  adminIpWhitelist,
  adminAudit,
} from "../middleware/adminSecurity.js";

const router = express.Router();

/* ================= FILE UPLOAD ================= */
const upload = getEstimateUploader("sowron-interiors/estimates");

/* ================= USER ================= */
router.post(
  "/send",
  protect,
  upload.single("file"),
  addEstimate
);

/* ================= ADMIN ================= */
router.use(adminProtect, adminIpWhitelist, adminAudit);

router.get("/", getEstimates);
router.patch("/:id", updateEstimate);
router.patch("/:id/note", addEstimateNote);
router.delete("/:id", deleteEstimate);

export default router;
