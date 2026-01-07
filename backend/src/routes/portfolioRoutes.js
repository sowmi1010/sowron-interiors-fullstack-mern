import express from "express";
import {
  addPortfolio,
  updatePortfolio,
  getPortfolio,
  deletePortfolio,
  getSinglePortfolio,
} from "../controllers/portfolioController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";

const router = express.Router();

/* 🌍 PUBLIC */
router.get("/", getPortfolio);
router.get("/:id", getSinglePortfolio);

/* 🔐 ADMIN */
router.post(
  "/add",
  protect,
  adminOnly,
  getUploader("sowron-interiors/portfolio").array("images", 10),
  addPortfolio
);

router.put(
  "/:id",
  protect,
  adminOnly,
  getUploader("sowron-interiors/portfolio").array("images", 10),
  updatePortfolio
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deletePortfolio
);

export default router;
