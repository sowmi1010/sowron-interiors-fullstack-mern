import mongoose from "mongoose";
import Gallery from "../models/Gallery.js";
import Category from "../models/Category.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";
import cloudinary from "../config/cloudinary.js";

/* SLUG */
const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const SIGNED_TTL = Number(process.env.GALLERY_SIGNED_TTL || 60);
const WATERMARK_TEXT = "SOWRON";

const signImage = (img, watermarkText = WATERMARK_TEXT) => {
  if (!img?.public_id) return img;

  const expiresAt = Math.floor(Date.now() / 1000) + SIGNED_TTL;
  const signedUrl = cloudinary.url(img.public_id, {
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
    transformation: [
      {
        overlay: {
          font_family: "Arial",
          font_size: 24,
          font_weight: "bold",
          text: watermarkText,
        },
        color: "white",
        opacity: 50,
        gravity: "south_east",
        x: 10,
        y: 10,
      },
    ],
  });

  return {
    ...img,
    url: signedUrl,
    expiresAt,
  };
};

const withSignedImages = (item) => {
  const data = item?.toObject ? item.toObject() : item;
  return {
    ...data,
    images: (data.images || []).map((img) => signImage(img)),
  };
};

/* ================= ADD ================= */
export const addGallery = async (req, res) => {
  let uploadedImages = [];

  try {
    const { title, categoryId, subCategory, description } = req.body;

    if (!title || !categoryId)
      return res.status(400).json({ message: "Title & category required" });

    if (!req.files?.length)
      return res.status(400).json({ message: "Images required" });

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(400).json({ message: "Invalid category" });

    if (subCategory && !category.subCategories.includes(subCategory)) {
      return res.status(400).json({ message: "Invalid subcategory" });
    }

    let slug = createSlug(title);
    const exists = await Gallery.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const item = await Gallery.create({
      title,
      slug,
      category: category._id,
      subCategory,
      description,
      images: uploadedImages,
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    if (uploadedImages.length) await deleteMultipleImages(uploadedImages);
    console.error("ADD GALLERY ERROR:", err);
    res.status(500).json({ message: "Gallery creation failed" });
  }
};

/* ================= LIST (PUBLIC + FILTER) ================= */
export const getGallery = async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    const filter = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    const items = await Gallery.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json(items.map(withSignedImages));
  } catch (err) {
    console.error("GET GALLERY ERROR:", err);
    res.status(500).json({ message: "Failed to load gallery" });
  }
};

/* ================= SINGLE ================= */
export const getSingleGallery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const item = await Gallery.findById(id).populate(
      "category",
      "name slug"
    );

    if (!item) return res.status(404).json({ message: "Not found" });

    res.json(withSignedImages(item));
  } catch (err) {
    console.error("GET SINGLE ERROR:", err);
    res.status(500).json({ message: "Failed to load item" });
  }
};

/* ================= UPDATE ================= */
export const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    const { title, categoryId, subCategory, description } = req.body;

    if (title && title !== gallery.title) {
      let slug = createSlug(title);
      const exists = await Gallery.findOne({
        slug,
        _id: { $ne: gallery._id },
      });
      if (exists) slug = `${slug}-${Date.now()}`;
      gallery.title = title;
      gallery.slug = slug;
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category)
        return res.status(400).json({ message: "Invalid category" });

      if (subCategory && !category.subCategories.includes(subCategory)) {
        return res.status(400).json({ message: "Invalid subcategory" });
      }

      gallery.category = category._id;
      gallery.subCategory = subCategory;
    }

    if (description !== undefined) gallery.description = description;

    if (req.files?.length) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      await deleteMultipleImages(gallery.images);
      gallery.images = newImages;
    }

    await gallery.save();
    res.json({ success: true, gallery });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE ================= */
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    await deleteMultipleImages(gallery.images);
    await gallery.deleteOne();

    res.json({ success: true, message: "Gallery deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
