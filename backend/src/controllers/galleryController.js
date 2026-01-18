import mongoose from "mongoose";
import Gallery from "../models/Gallery.js";
import Category from "../models/Category.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";

/* 🔑 SLUG GENERATOR */
const createSlug = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

/* ================= ADD GALLERY ================= */
export const addGallery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedImages = [];

  try {
    const { title, categoryId, description } = req.body;

    if (!title || !categoryId) {
      return res.status(400).json({ message: "Title & Category required" });
    }

    if (!req.files?.length) {
      return res.status(400).json({ message: "Images required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
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
          category: category._id,
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

    await deleteMultipleImages(uploadedImages);

    console.error("ADD GALLERY ERROR:", err);
    res.status(500).json({ message: "Gallery creation failed" });
  }
};

/* ================= LIST (PUBLIC) ================= */
export const getGallery = async (req, res) => {
  try {
    const items = await Gallery.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SINGLE ================= */
export const getSingleGallery = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!item) return res.status(404).json({ message: "Not found" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateGallery = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const gallery = await Gallery.findById(req.params.id).session(session);
    if (!gallery) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    const { title, categoryId, description } = req.body;

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Invalid category" });
      }
      gallery.category = category._id;
    }

    if (title) gallery.title = title;
    if (description) gallery.description = description;

    if (req.files?.length) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      await deleteMultipleImages(gallery.images);
      gallery.images = newImages;
    }

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

/* ================= DELETE ================= */
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ message: "Not found" });

    await deleteMultipleImages(gallery.images);
    await gallery.deleteOne();

    res.json({ success: true, message: "Gallery deleted" });
  } catch (err) {
    console.error("DELETE GALLERY ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
