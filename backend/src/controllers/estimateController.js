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
      city: req.body.city,
      homeType: req.body.homeType,
      budget: req.body.budget,
      requirements: req.body.requirements,
      file: req.file?.filename || null,
    });

    res.status(201).json({ success: true, estimate });
  } catch (err) {
    console.error("ADD ESTIMATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN GET ALL ================= */
export const getEstimates = async (req, res) => {
  try {
    const list = await Estimate.find().sort({ createdAt: -1 });
    res.json(list);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN UPDATE STATUS ================= */
export const updateEstimate = async (req, res) => {
  try {
    const updated = await Estimate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    res.json({ success: true, updated });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN ADD NOTE (CRM STYLE) ================= */
export const addEstimateNote = async (req, res) => {
  try {
    const { message, status } = req.body;

    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    estimate.notes.push({
      message,
      status,
      by: req.user.name || "Admin",
    });

    estimate.status = status;
    estimate.lastContactedAt = new Date();

    await estimate.save();

    res.json({ success: true, estimate });
  } catch (err) {
    console.error("ADD NOTE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN DELETE ================= */
export const deleteEstimate = async (req, res) => {
  try {
    const deleted = await Estimate.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Estimate not found" });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
