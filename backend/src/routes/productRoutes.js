import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadCloudinary } from "../utils/uploadCloudinary.js";

const router = express.Router();

// 🌍 PUBLIC
router.get("/", getProducts);

// 🔐 ADMIN ONLY
router.post(
  "/add",
  protect,
  adminOnly,
  uploadCloudinary.array("images", 5),
  addProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadCloudinary.array("images", 5),
  updateProduct
);

router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
