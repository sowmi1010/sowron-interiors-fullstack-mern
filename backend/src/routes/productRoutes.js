import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";
import Product from "../models/Product.js";

const router = express.Router();

/* ================= ADMIN LIST (SEARCH + PAGINATION) ================= */
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 6, q = "" } = req.query;

    const match = q
      ? {
          title: { $regex: q, $options: "i" },
        }
      : {};

    const items = await Product.find(match)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(match);

    res.json({ items, total });
  } catch (err) {
    console.error("ADMIN PRODUCT LIST ERROR:", err);
    res.status(500).json({ message: "Failed to load products" });
  }
});

/* ================= PUBLIC ================= */
router.get("/", getProducts);
router.get("/:id", getProductById);

/* ================= ADD ================= */
router.post(
  "/add",
  protect,
  adminOnly,
  getUploader("sowron-interiors/products").array("images", 5),
  addProduct
);

/* ================= UPDATE ================= */
router.put(
  "/:id",
  protect,
  adminOnly,
  getUploader("sowron-interiors/products").array("images", 5),
  updateProduct
);

/* ================= DELETE ================= */
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
