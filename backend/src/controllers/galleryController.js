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

const toPositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const SIGNED_TTL = toPositiveInt(process.env.GALLERY_SIGNED_TTL, 3600);
const WATERMARK_TEXT = String(
  process.env.GALLERY_WATERMARK_TEXT || "SOWRON"
)
  .trim()
  .slice(0, 40);

const getSignedExpiry = () => {
  const now = Math.floor(Date.now() / 1000);
  return Math.floor(now / SIGNED_TTL) * SIGNED_TTL + SIGNED_TTL;
};

const buildSignedGalleryUrl = (publicId, options = {}, expiresAt = getSignedExpiry()) => {
  if (!publicId) return "";

  const {
    width,
    height,
    crop = "limit",
    gravity = "auto",
    quality = "auto:good",
    watermarkText = WATERMARK_TEXT,
  } = options;

  const sizeTransform = {};
  if (Number.isFinite(width) && width > 0) sizeTransform.width = Math.round(width);
  if (Number.isFinite(height) && height > 0) sizeTransform.height = Math.round(height);

  if (sizeTransform.width || sizeTransform.height) {
    sizeTransform.crop = crop;
    if (crop !== "limit" && gravity) {
      sizeTransform.gravity = gravity;
    }
  }

  const transformation = [{ fetch_format: "auto", quality }];
  if (sizeTransform.width || sizeTransform.height) {
    transformation.push(sizeTransform);
  }

  if (watermarkText) {
    transformation.push({
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
    });
  }

  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
    transformation,
  });
};

const signImage = (img, expiresAt = getSignedExpiry()) => {
  if (!img?.public_id) return img;

  const thumbUrl = buildSignedGalleryUrl(
    img.public_id,
    { width: 900, height: 620, crop: "fill", gravity: "auto" },
    expiresAt
  );
  const mediumUrl = buildSignedGalleryUrl(
    img.public_id,
    { width: 1600, crop: "limit" },
    expiresAt
  );
  const fullUrl = buildSignedGalleryUrl(
    img.public_id,
    { width: 2600, crop: "limit", quality: "auto:best" },
    expiresAt
  );

  return {
    ...img,
    originalUrl: img.url,
    thumbUrl,
    mediumUrl,
    fullUrl,
    url: mediumUrl || img.url,
    expiresAt,
  };
};

const withSignedImages = (item, { coverOnly = false } = {}) => {
  const data = item?.toObject ? item.toObject() : item;
  const sourceImages = Array.isArray(data.images) ? data.images : [];
  const images = coverOnly ? sourceImages.slice(0, 1) : sourceImages;
  const expiresAt = getSignedExpiry();

  return {
    ...data,
    images: images.map((img) => signImage(img, expiresAt)),
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
      .sort({ createdAt: -1 })
      .lean();

    res.set("Cache-Control", "public, max-age=60, s-maxage=300");
    res.json(items.map((item) => withSignedImages(item, { coverOnly: true })));
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
    ).lean();

    if (!item) return res.status(404).json({ message: "Not found" });

    res.set("Cache-Control", "public, max-age=60, s-maxage=300");
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
