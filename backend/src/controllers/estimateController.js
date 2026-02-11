import mongoose from "mongoose";
import fs from "fs/promises";

import Estimate from "../models/Estimate.js";
import { deleteImage } from "../services/cloudinary.service.js";

const toPositiveInt = (value, fallback, max = 100) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
};

const escapeRegex = (input = "") => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isLocalUploadPath = (p = "") =>
  typeof p === "string" &&
  (p.includes("\\uploads\\") || p.includes("/uploads/"));

/* ================= USER SUBMIT ================= */
export const addEstimate = async (req, res) => {
  try {
    if (!req.user?.phone || !req.user?.name) {
      return res.status(401).json({ message: "Login required" });
    }

    if (req.file?.path && isLocalUploadPath(req.file.path)) {
      try {
        await fs.unlink(req.file.path);
      } catch {
        // ignore cleanup errors
      }
      return res.status(500).json({
        message: "Upload misconfigured. Please try again.",
      });
    }

    const estimate = await Estimate.create({
      name: req.user.name,
      phone: req.user.phone,
      city: req.body.city?.trim(),
      homeType: req.body.homeType?.trim(),
      budget: req.body.budget?.trim(),
      requirements: req.body.requirements?.trim(),
      fileUrl: req.file?.path || null,
      filePublicId: req.file?.filename || null,
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
    const page = toPositiveInt(req.query.page, 1, 1_000_000);
    const limit = toPositiveInt(req.query.limit, 10, 200);
    const keyword = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.q !== undefined;

    const filter = {};
    if (keyword) {
      const regex = new RegExp(escapeRegex(keyword), "i");
      filter.$or = [
        { name: regex },
        { phone: regex },
        { city: regex },
        { homeType: regex },
        { budget: regex },
        { status: regex },
      ];
    }

    const baseQuery = Estimate.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "name phone city homeType budget status notes requirements fileUrl createdAt lastContactedAt"
      )
      .lean();

    if (wantsPagination) {
      const [items, total] = await Promise.all([
        baseQuery.clone().skip((page - 1) * limit).limit(limit),
        Estimate.countDocuments(filter),
      ]);
      return res.json({ items, total, page, limit });
    }

    const list = await baseQuery;

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

    if (deleted.filePublicId) {
      await deleteImage(deleted.filePublicId);
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
