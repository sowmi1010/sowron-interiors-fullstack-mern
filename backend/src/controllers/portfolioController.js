import Portfolio from "../models/Portfolio.js";
import cloudinary from "../config/cloudinary.js";

/* ================= ADD PORTFOLIO ================= */
export const addPortfolio = async (req, res) => {
  try {
    const { title, location, description, video } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const images = req.files?.map((file) => ({
      url: file.path,
      public_id: file.filename,
    })) || [];

    const portfolio = await Portfolio.create({
      title,
      location,
      description,
      video,
      images,
    });

    res.json({ success: true, portfolio });
  } catch (err) {
    console.error("ADD PORTFOLIO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL ================= */
export const getPortfolio = async (req, res) => {
  try {
    const list = await Portfolio.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET SINGLE ================= */
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
  try {
    const { title, location, description, video } = req.body;

    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    /* 🔥 DELETE OLD IMAGES IF NEW ONES UPLOADED */
    if (req.files && req.files.length > 0) {
      for (const img of portfolio.images) {
        await cloudinary.uploader.destroy(img.public_id);
      }

      portfolio.images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    portfolio.title = title || portfolio.title;
    portfolio.location = location || portfolio.location;
    portfolio.description = description || portfolio.description;
    portfolio.video = video || portfolio.video;

    await portfolio.save();

    res.json({ success: true, portfolio });
  } catch (err) {
    console.error("UPDATE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE PORTFOLIO ================= */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    /* 🔥 DELETE ALL CLOUDINARY IMAGES */
    for (const img of portfolio.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await portfolio.deleteOne();

    res.json({ success: true, message: "Portfolio deleted successfully" });
  } catch (err) {
    console.error("DELETE PORTFOLIO ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
