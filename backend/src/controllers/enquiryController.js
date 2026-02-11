import mongoose from "mongoose";
import Enquiry from "../models/Enquiry.js";

const toPositiveInt = (value, fallback, max = 100) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
};

const escapeRegex = (input = "") => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ================= PUBLIC ADD ================= */
export const addEnquiry = async (req, res) => {
  try {
    const { name, phone, city, message, projectId, projectTitle, projectLocation } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const enquiry = await Enquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      city: city?.trim(),
      message: message?.trim(),
      projectId: projectId || null,
      projectTitle: projectTitle?.trim(),
      projectLocation: projectLocation?.trim(),
    });

    res.status(201).json({
      success: true,
      enquiry,
    });
  } catch (err) {
    console.error("ADD ENQUIRY ERROR:", err);
    res.status(500).json({ message: "Failed to submit enquiry" });
  }
};

/* ================= ADMIN LIST ================= */
export const getEnquiries = async (req, res) => {
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
        { projectTitle: regex },
        { message: regex },
        { status: regex },
      ];
    }

    const baseQuery = Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "name phone city message status projectTitle projectLocation replyMessage repliedAt createdAt"
      )
      .lean();

    if (wantsPagination) {
      const [items, total] = await Promise.all([
        baseQuery.clone().skip((page - 1) * limit).limit(limit),
        Enquiry.countDocuments(filter),
      ]);
      return res.json({ items, total, page, limit });
    }

    const list = await baseQuery;

    res.json(list);
  } catch (err) {
    console.error("GET ENQUIRIES ERROR:", err);
    res.status(500).json({ message: "Failed to load enquiries" });
  }
};

/* ================= ADMIN UPDATE ================= */
export const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid enquiry ID" });
    }

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (status) {
      enquiry.status = status;
    }

    if (replyMessage) {
      enquiry.replyMessage = replyMessage.trim();
      enquiry.repliedAt = new Date();
      enquiry.status = "replied";
    }

    await enquiry.save();

    res.json({
      success: true,
      enquiry,
    });
  } catch (err) {
    console.error("UPDATE ENQUIRY ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= ADMIN DELETE ================= */
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid enquiry ID" });
    }

    const enquiry = await Enquiry.findByIdAndDelete(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({
      success: true,
      message: "Enquiry deleted",
    });
  } catch (err) {
    console.error("DELETE ENQUIRY ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
