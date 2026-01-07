import express from "express";
import multer from "multer";
import {
  addEstimate,
  getEstimates,
  updateEstimate,
  deleteEstimate,
  addEstimateNote,
} from "../controllers/estimateController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({ dest: "uploads/estimate" });

/* ===== USER (LOGIN REQUIRED) ===== */
router.post("/send", protect, upload.single("file"), addEstimate);

/* ===== ADMIN ===== */
router.use(protect, adminOnly);

router.get("/", getEstimates);
router.patch("/:id", updateEstimate);
router.patch("/:id/note", addEstimateNote);
router.delete("/:id", deleteEstimate);

export default router;
