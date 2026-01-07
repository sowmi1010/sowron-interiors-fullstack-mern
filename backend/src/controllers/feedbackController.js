import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import { deleteImage } from "../services/cloudinary.service.js";

/* ================= ADD FEEDBACK ================= */
export const addFeedback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let uploadedPhoto = null;

  try {
    const { name, city, rating, message } = req.body;

    if (!name || !city || !rating) {
      return res.status(400).json({
        message: "Name, City and Rating are required",
      });
    }

    const parsedRating = Number(rating);
    if (parsedRating < 1 || parsedRating > 5) {
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

    const [fb] = await Feedback.create(
      [
        {
          name: name.trim(),
          city: city.trim(),
          rating: parsedRating,
          message: message?.trim(),
          photo: uploadedPhoto,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, fb });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // 🔥 rollback uploaded image
    if (uploadedPhoto?.public_id) {
      await deleteImage(uploadedPhoto.public_id);
    }

    console.error("ADD FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Feedback creation failed" });
  }
};

/* ================= LIST ================= */
export const getFeedback = async (req, res) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.json(list);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SINGLE ================= */
export const getSingleFeedbackById = async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) {
      return res.status(404).json({
        message: "Feedback not found",
      });
    }
    res.json(fb);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE ================= */
export const updateFeedback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fb = await Feedback.findById(req.params.id).session(session);
    if (!fb) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    if (req.body.name) fb.name = req.body.name.trim();
    if (req.body.city) fb.city = req.body.city.trim();
    if (req.body.rating) fb.rating = Number(req.body.rating);
    if (req.body.message) fb.message = req.body.message.trim();

    if (req.file) {
      // 🔥 delete old image FIRST
      if (fb.photo?.public_id) {
        const ok = await deleteImage(fb.photo.public_id);
        if (!ok) {
          await session.abortTransaction();
          return res.status(500).json({
            message: "Old image delete failed",
          });
        }
      }

      fb.photo = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await fb.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, fb });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("UPDATE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE ================= */
export const deleteFeedback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fb = await Feedback.findById(req.params.id).session(session);
    if (!fb) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Feedback not found",
      });
    }

    // 🔥 delete image FIRST
    if (fb.photo?.public_id) {
      const ok = await deleteImage(fb.photo.public_id);
      if (!ok) {
        await session.abortTransaction();
        return res.status(500).json({
          message: "Image delete failed",
        });
      }
    }

    await fb.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("DELETE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
