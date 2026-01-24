import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import { deleteImage } from "../services/cloudinary.service.js";

/* ================= ADD FEEDBACK ================= */
export const addFeedback = async (req, res) => {
  let uploadedPhoto = null;

  try {
    const { name, city, rating, message } = req.body;

    if (!name || !city || !rating) {
      return res.status(400).json({
        message: "Name, city and rating are required",
      });
    }

    const parsedRating = Number(rating);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (req.file) {
      uploadedPhoto = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const fb = await Feedback.create({
      name: name.trim(),
      city: city.trim(),
      rating: parsedRating,
      message: message?.trim(),
      photo: uploadedPhoto,
    });

    res.status(201).json({
      success: true,
      feedback: fb,
    });
  } catch (err) {
    if (uploadedPhoto?.public_id) {
      await deleteImage(uploadedPhoto.public_id);
    }

    console.error("ADD FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Feedback creation failed" });
  }
};

/* ================= LIST (PUBLIC) ================= */
export const getFeedback = async (req, res) => {
  try {
    const list = await Feedback.find()
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("GET FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Failed to load feedback" });
  }
};

/* ================= SINGLE ================= */
export const getSingleFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    const fb = await Feedback.findById(id);

    if (!fb) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    res.json(fb);
  } catch (err) {
    console.error("GET SINGLE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

/* ================= UPDATE ================= */
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    const fb = await Feedback.findById(id);

    if (!fb) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    if (req.body.name) fb.name = req.body.name.trim();
    if (req.body.city) fb.city = req.body.city.trim();

    if (req.body.rating) {
      const r = Number(req.body.rating);
      if (r < 1 || r > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }
      fb.rating = r;
    }

    if (req.body.message !== undefined) {
      fb.message = req.body.message.trim();
    }

    if (req.file) {
      if (fb.photo?.public_id) {
        await deleteImage(fb.photo.public_id);
      }

      fb.photo = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await fb.save();

    res.json({
      success: true,
      feedback: fb,
    });
  } catch (err) {
    console.error("UPDATE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE ================= */
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feedback ID" });
    }

    const fb = await Feedback.findById(id);

    if (!fb) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    if (fb.photo?.public_id) {
      await deleteImage(fb.photo.public_id);
    }

    await fb.deleteOne();

    res.json({
      success: true,
      message: "Feedback deleted",
    });
  } catch (err) {
    console.error("DELETE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
