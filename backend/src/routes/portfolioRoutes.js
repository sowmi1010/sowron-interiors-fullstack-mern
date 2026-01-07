import express from "express";
import {
  addPortfolio,
  updatePortfolio,
  getPortfolio,
  deletePortfolio,
  getSinglePortfolio,
} from "../controllers/portfolioController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";

const router = express.Router();

/* ========== PUBLIC ========== */
router.get("/", getPortfolio);
router.get("/:id", getSinglePortfolio);

/* ========== ADMIN ========== */
router.use(protect, adminOnly);

router.post(
  "/add",
  uploadCloudinary.array("images", 10),
  addPortfolio
);

router.put(
  "/update/:id",
  uploadCloudinary.array("images", 10),
  updatePortfolio
);

router.delete("/:id", deletePortfolio);

export default router;
