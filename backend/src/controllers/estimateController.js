import mongoose from "mongoose";
import Estimate from "../models/Estimate.js";

/* ================= USER SUBMIT ================= */
export const addEstimate = async (req, res) => {
  try {
    if (!req.user?.phone || !req.user?.name) {
      return res.status(401).json({ message: "Login required" });
    }

    const estimate = await Estimate.create({
      name: req.user.name,
      phone: req.user.phone,
      city: req.body.city?.trim(),
      homeType: req.body.homeType?.trim(),
      budget: req.body.budget?.trim(),
      requirements: req.body.requirements?.trim(),
      file: req.file?.filename || null,
    });

    res.status(201).json({
      success: true,
      estimate,
    });
  } catch (err) {
    console.error("ADD ESTIMATE ERROR:", err);
    res.status(500).json({ message: "Failed to submit estimate" });
  }
};

/* ================= ADMIN LIST ================= */
export const getEstimates = async (req, res) => {
  try {
    const list = await Estimate.find()
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("GET ESTIMATES ERROR:", err);
    res.status(500).json({ message: "Failed to load estimates" });
  }
};

/* ================= ADMIN UPDATE ================= */
export const updateEstimate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid estimate ID" });
    }

    const updated = await Estimate.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    res.json({
      success: true,
      estimate: updated,
    });
  } catch (err) {
    console.error("UPDATE ESTIMATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= ADMIN ADD NOTE ================= */
export const addEstimateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid estimate ID" });
    }

    if (!message || !status) {
      return res.status(400).json({
        message: "Message and status are required",
      });
    }

    const estimate = await Estimate.findById(id);
    if (!estimate) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    estimate.notes.push({
      message: message.trim(),
      status,
      by: req.user.name || "Admin",
    });

    estimate.status = status;
    estimate.lastContactedAt = new Date();

    await estimate.save();

    res.json({
      success: true,
      estimate,
    });
  } catch (err) {
    console.error("ADD NOTE ERROR:", err);
    res.status(500).json({ message: "Failed to add note" });
  }
};

/* ================= ADMIN DELETE ================= */
export const deleteEstimate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid estimate ID" });
    }

    const deleted = await Estimate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    res.json({
      success: true,
      message: "Estimate deleted",
    });
  } catch (err) {
    console.error("DELETE ESTIMATE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
