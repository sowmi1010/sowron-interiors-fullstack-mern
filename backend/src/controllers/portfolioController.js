import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";

/* ================= ADD PORTFOLIO ================= */
export const addPortfolio = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedImages = [];

  try {
    const { title, location, description, video } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    uploadedImages =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

    const [portfolio] = await Portfolio.create(
      [
        {
          title: title.trim(),
          location: location?.trim(),
          description: description?.trim(),
          video,
          images: uploadedImages,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, portfolio });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // 🔥 rollback uploaded images
    await deleteMultipleImages(uploadedImages);

    console.error("ADD PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Portfolio creation failed" });
  }
};

/* ================= LIST ================= */
export const getPortfolio = async (req, res) => {
  try {
    const list = await Portfolio.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SINGLE ================= */
export const getSinglePortfolio = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PORTFOLIO ================= */
export const updatePortfolio = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const portfolio = await Portfolio.findById(req.params.id).session(session);
    if (!portfolio) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const { title, location, description, video } = req.body;

    let newImages = null;

    if (req.files?.length) {
      newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      // 🔥 delete old images FIRST
      const failed = await deleteMultipleImages(portfolio.images);
      if (failed.length) {
        await session.abortTransaction();
        return res.status(500).json({
          message: "Old image delete failed",
          failed,
        });
      }

      portfolio.images = newImages;
    }

    portfolio.title = title?.trim() ?? portfolio.title;
    portfolio.location = location?.trim() ?? portfolio.location;
    portfolio.description =
      description?.trim() ?? portfolio.description;
    portfolio.video = video ?? portfolio.video;

    await portfolio.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, portfolio });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("UPDATE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE PORTFOLIO ================= */
export const deletePortfolio = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const portfolio = await Portfolio.findById(req.params.id).session(session);
    if (!portfolio) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Portfolio not found" });
    }

    // 🔥 delete images FIRST
    const failed = await deleteMultipleImages(portfolio.images);
    if (failed.length) {
      await session.abortTransaction();
      return res.status(500).json({
        message: "Image delete failed",
        failed,
      });
    }

    await portfolio.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Portfolio deleted successfully",
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("DELETE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
