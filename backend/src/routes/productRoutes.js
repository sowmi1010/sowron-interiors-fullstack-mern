import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";

const router = express.Router();

/* 🌍 PUBLIC */
router.get("/", getProducts);

/* 🔐 ADMIN ONLY */

/* ➕ ADD PRODUCT */
router.post(
  "/add",
  protect,
  adminOnly,
  getUploader("sowron-interiors/products").array("images", 5),
  addProduct
);

/* ✏️ UPDATE PRODUCT */
router.put(
  "/:id",
  protect,
  adminOnly,
  getUploader("sowron-interiors/products").array("images", 5),
  updateProduct
);

/* ❌ DELETE PRODUCT */
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteProduct
);

export default router;
