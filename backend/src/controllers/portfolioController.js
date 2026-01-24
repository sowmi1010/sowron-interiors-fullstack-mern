import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";

/* ================= ADD PORTFOLIO ================= */
export const addPortfolio = async (req, res) => {
  let uploadedImages = [];

  try {
    const { title, location, description, video } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.files?.length && !video) {
      return res.status(400).json({
        message: "At least one image or video is required",
      });
    }

    uploadedImages =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

    const portfolio = await Portfolio.create({
      title: title.trim(),
      location: location?.trim(),
      description: description?.trim(),
      video,
      images: uploadedImages,
    });

    res.status(201).json({
      success: true,
      portfolio,
    });
  } catch (err) {
    if (uploadedImages.length) {
      await deleteMultipleImages(uploadedImages);
    }

    console.error("ADD PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Portfolio creation failed" });
  }
};

/* ================= LIST (PUBLIC) ================= */
export const getPortfolio = async (req, res) => {
  try {
    const list = await Portfolio.find()
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("GET PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Failed to load portfolio" });
  }
};

/* ================= SINGLE ================= */
export const getSinglePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" });
    }

    const item = await Portfolio.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json(item);
  } catch (err) {
    console.error("GET SINGLE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Failed to fetch portfolio" });
  }
};

/* ================= UPDATE ================= */
export const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" });
    }

    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    const { title, location, description, video } = req.body;

    if (req.files?.length) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      await deleteMultipleImages(portfolio.images);
      portfolio.images = newImages;
    }

    portfolio.title = title?.trim() ?? portfolio.title;
    portfolio.location = location?.trim() ?? portfolio.location;
    portfolio.description = description?.trim() ?? portfolio.description;
    portfolio.video = video ?? portfolio.video;

    await portfolio.save();

    res.json({
      success: true,
      portfolio,
    });
  } catch (err) {
    console.error("UPDATE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE ================= */
export const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid portfolio ID" });
    }

    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    await deleteMultipleImages(portfolio.images);
    await portfolio.deleteOne();

    res.json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (err) {
    console.error("DELETE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
