import mongoose from "mongoose";
import Gallery from "../models/Gallery.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";

/* 🔑 SLUG GENERATOR */
const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

/* ================= ADD GALLERY ================= */
export const addGallery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedImages = [];

  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        message: "Title & Category required",
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        message: "Images required",
      });
    }

    let slug = createSlug(title);
    const exists = await Gallery.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const [item] = await Gallery.create(
      [
        {
          title,
          category,
          description,
          slug,
          images: uploadedImages,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, item });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // 🔥 rollback uploaded images
    await deleteMultipleImages(uploadedImages);

    console.error("ADD GALLERY ERROR:", err);
    res.status(500).json({ message: "Gallery creation failed" });
  }
};

/* ================= LIST (PUBLIC) ================= */
export const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const items = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json(items);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SINGLE ================= */
export const getSingleGallery = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(item);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE GALLERY ================= */
export const updateGallery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gallery = await Gallery.findById(req.params.id).session(session);
    if (!gallery) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    const { title, category, description } = req.body;

    let newImages = null;

    if (req.files?.length) {
      newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      // 🔥 delete old images FIRST
      const failed = await deleteMultipleImages(gallery.images);
      if (failed.length) {
        await session.abortTransaction();
        return res.status(500).json({
          message: "Old image delete failed",
          failed,
        });
      }

      gallery.images = newImages;
    }

    gallery.title = title ?? gallery.title;
    gallery.category = category ?? gallery.category;
    gallery.description = description ?? gallery.description;

    await gallery.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, gallery });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("UPDATE GALLERY ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE GALLERY ================= */
export const deleteGallery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gallery = await Gallery.findById(req.params.id).session(session);
    if (!gallery) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    // 🔥 delete images FIRST
    const failed = await deleteMultipleImages(gallery.images);
    if (failed.length) {
      await session.abortTransaction();
      return res.status(500).json({
        message: "Image delete failed",
        failed,
      });
    }

    await gallery.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Gallery deleted" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("DELETE GALLERY ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
