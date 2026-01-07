import Gallery from "../models/Gallery.js";
import cloudinary from "../config/cloudinary.js";

/* 🔑 SLUG GENERATOR */
const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ================= ADD ================= */
export const addGallery = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res
        .status(400)
        .json({ message: "Title & Category required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    /* ✅ CREATE UNIQUE SLUG */
    let slug = createSlug(title);

    const exists = await Gallery.findOne({ slug });
    if (exists) {
      slug = `${slug}-${Date.now()}`;
    }

    /* ✅ CLOUDINARY FILES */
    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const item = await Gallery.create({
      title,
      category,
      description,
      slug, // 🔥 FIXED
      images,
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("ADD GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= LIST ================= */
export const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const items = await Gallery.find(filter).sort({ createdAt: -1 });

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SINGLE (FIXED) ================= */
export const getSingleGallery = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    res.json({ item }); // ✅ IMPORTANT
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    const { title, category, description } = req.body;

    if (req.files && req.files.length > 0) {
      // 🔥 delete old images
      for (const img of gallery.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      gallery.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    gallery.title = title ?? gallery.title;
    gallery.category = category ?? gallery.category;
    gallery.description = description ?? gallery.description;

    await gallery.save();

    res.json({ success: true, gallery });
  } catch (err) {
    console.error("UPDATE GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    for (const img of gallery.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await gallery.deleteOne();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
