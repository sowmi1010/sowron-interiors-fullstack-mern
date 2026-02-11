import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import { deleteMultipleImages } from "../services/cloudinary.service.js";
import cloudinary from "../config/cloudinary.js";

const buildPortfolioImageUrl = (publicId, options = {}) => {
  if (!publicId) return "";

  const { width, height, crop = "limit", gravity = "auto", quality = "auto:good" } = options;
  const transform = [{ fetch_format: "auto", quality }];

  if (Number.isFinite(width) && width > 0) {
    const size = { width: Math.round(width), crop };
    if (Number.isFinite(height) && height > 0) {
      size.height = Math.round(height);
    }
    if (crop !== "limit" && gravity) {
      size.gravity = gravity;
    }
    transform.push(size);
  }

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transform,
  });
};

const optimizePortfolioImage = (img) => {
  if (!img?.public_id) return img;

  const thumbUrl = buildPortfolioImageUrl(img.public_id, {
    width: 860,
    height: 560,
    crop: "fill",
    gravity: "auto",
  });
  const mediumUrl = buildPortfolioImageUrl(img.public_id, {
    width: 1600,
    crop: "limit",
  });
  const fullUrl = buildPortfolioImageUrl(img.public_id, {
    width: 2600,
    crop: "limit",
    quality: "auto:best",
  });

  return {
    ...img,
    originalUrl: img.url,
    thumbUrl,
    mediumUrl,
    fullUrl,
    url: mediumUrl || img.url,
  };
};

const withOptimizedPortfolioImages = (item) => {
  const data = item?.toObject ? item.toObject() : item;
  return {
    ...data,
    images: (data.images || []).map(optimizePortfolioImage),
  };
};

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
      .sort({ createdAt: -1 })
      .lean();

    res.set("Cache-Control", "public, max-age=60, s-maxage=300");
    res.json(list.map(withOptimizedPortfolioImages));
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

    const item = await Portfolio.findById(id).lean();

    if (!item) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.set("Cache-Control", "public, max-age=60, s-maxage=300");
    res.json(withOptimizedPortfolioImages(item));
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
