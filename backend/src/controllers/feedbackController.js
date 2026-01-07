import Feedback from "../models/Feedback.js";
import cloudinary from "../config/cloudinary.js";

/* ================= ADD FEEDBACK ================= */
export const addFeedback = async (req, res) => {
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

    const photo = req.file
      ? {
          url: req.file.path,
          public_id: req.file.filename,
        }
      : null;

    const fb = await Feedback.create({
      name: name.trim(),
      city: city.trim(),
      rating: parsedRating,
      message: message?.trim(),
      photo,
    });

    res.status(201).json({ success: true, fb });
  } catch (err) {
    console.error("ADD FEEDBACK ERROR:", err);
    res.status(500).json({ message: err.message });
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
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    res.json(fb);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE (AUTO DELETE OLD IMAGE) ================= */
export const updateFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    if (req.body.name) fb.name = req.body.name.trim();
    if (req.body.city) fb.city = req.body.city.trim();
    if (req.body.rating) fb.rating = Number(req.body.rating);
    if (req.body.message) fb.message = req.body.message.trim();

    if (req.file) {
      // 🔥 DELETE OLD CLOUDINARY IMAGE
      if (fb.photo?.public_id) {
        await cloudinary.uploader.destroy(fb.photo.public_id);
      }

      fb.photo = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await fb.save();
    res.json({ success: true, fb });
  } catch (err) {
    console.error("UPDATE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE (AUTO DELETE IMAGE) ================= */
export const deleteFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    // 🔥 DELETE CLOUDINARY IMAGE
    if (fb.photo?.public_id) {
      await cloudinary.uploader.destroy(fb.photo.public_id);
    }

    await fb.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
