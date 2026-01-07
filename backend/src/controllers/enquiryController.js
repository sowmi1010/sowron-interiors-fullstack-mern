import Enquiry from "../models/Enquiry.js";

/* ================= PUBLIC ADD ================= */
export const addEnquiry = async (req, res) => {
  try {
    const { name, phone, city, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const enquiry = await Enquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      city: city?.trim(),
      message: message?.trim(),
    });

    res.status(201).json({ success: true, enquiry });
  } catch (err) {
    console.error("ADD ENQUIRY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN LIST ================= */
export const getEnquiries = async (req, res) => {
  try {
    const list = await Enquiry.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN UPDATE ================= */
export const updateEnquiry = async (req, res) => {
  try {
    const { status, replyMessage } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    if (status) enquiry.status = status;

    if (replyMessage) {
      enquiry.replyMessage = replyMessage.trim();
      enquiry.repliedAt = new Date();
      enquiry.status = "replied";
    }

    await enquiry.save();

    res.json({ success: true, enquiry });
  } catch (err) {
    console.error("UPDATE ENQUIRY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ADMIN DELETE ================= */
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({ success: true, message: "Enquiry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
