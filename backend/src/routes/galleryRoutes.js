import express from "express";
import {
  addGallery,
  getGallery,
  getSingleGallery,
  updateGallery,
  deleteGallery,
} from "../controllers/galleryController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUploader } from "../utils/uploadCloudinary.js";
import Gallery from "../models/Gallery.js";

const router = express.Router();

/* ===========================
   🌍 PUBLIC
=========================== */
router.get("/", getGallery);

/* ===========================
   🔐 ADMIN – LIST + SEARCH + PAGINATION (FIXED)
=========================== */
router.get("/admin", protect, adminOnly, async (req, res) => {
  try {
    let { page = 1, limit = 9, q } = req.query;

    page = Number(page);
    limit = Number(limit);

    // 🔥 FIX: sanitize search query
    const search = q && q.trim().length > 0 ? q.trim() : null;

    const filter = search
      ? { title: { $regex: search, $options: "i" } }
      : {};

    const items = await Gallery.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Gallery.countDocuments(filter);

    res.json({ items, total });
  } catch (err) {
    console.error("ADMIN GALLERY LIST ERROR:", err);
    res.status(400).json({ message: "Invalid query parameters" });
  }
});

/* ===========================
   🌍 PUBLIC SINGLE
=========================== */
router.get("/:id", getSingleGallery);

/* ===========================
   🔐 ADMIN CRUD
=========================== */
router.post(
  "/add",
  protect,
  adminOnly,
  getUploader("sowron-interiors/gallery").array("images", 8),
  addGallery
);

router.put(
  "/:id",
  protect,
  adminOnly,
  getUploader("sowron-interiors/gallery").array("images", 8),
  updateGallery
);

router.delete("/:id", protect, adminOnly, deleteGallery);

export default router;
