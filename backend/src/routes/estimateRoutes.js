import express from "express";
import multer from "multer";
import path from "path";

import {
  addEstimate,
  getEstimates,
  updateEstimate,
  deleteEstimate,
  addEstimateNote,
} from "../controllers/estimateController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= FILE UPLOAD ================= */
const storage = multer.diskStorage({
  destination: "uploads/estimate",
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= USER ================= */
router.post(
  "/send",
  protect,
  upload.single("file"),
  addEstimate
);

/* ================= ADMIN ================= */
router.use(protect, adminOnly);

router.get("/", getEstimates);
router.patch("/:id", updateEstimate);
router.patch("/:id/note", addEstimateNote);
router.delete("/:id", deleteEstimate);

export default router;
