import mongoose from "mongoose";
import Booking from "../models/Booking.js";

const toPositiveInt = (value, fallback, max = 100) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
};

const escapeRegex = (input = "") => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ================= ADD BOOKING ================= */
export const addBooking = async (req, res) => {
  try {
    const { date, time, city } = req.body;
    const phone = req.user?.phone || req.body.phone;

    if (!date || !time || !city || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const booking = await Booking.create({
      phone: phone.trim(),
      date,
      time,
      city: city.trim(),
      status: "pending",
    });

    // 🔥 Real-time admin update
    req.app.get("io")?.emit("new_booking", booking);

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (err) {
    // 🔒 Slot already booked
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Selected slot already booked",
      });
    }

    console.error("ADD BOOKING ERROR:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};

/* ================= GET BOOKINGS (ADMIN) ================= */
export const getBookings = async (req, res) => {
  try {
    const { status, date, q } = req.query;
    const page = toPositiveInt(req.query.page, 1, 1_000_000);
    const limit = toPositiveInt(req.query.limit, 10, 200);
    const keyword = typeof q === "string" ? q.trim() : "";
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.q !== undefined;

    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (keyword) {
      const regex = new RegExp(escapeRegex(keyword), "i");
      filter.$or = [
        { phone: regex },
        { city: regex },
        { date: regex },
        { time: regex },
        { status: regex },
      ];
    }

    const baseQuery = Booking.find(filter)
      .sort({ createdAt: -1 })
      .select("phone date time city status createdAt")
      .lean();

    if (wantsPagination) {
      const [items, total] = await Promise.all([
        baseQuery.clone().skip((page - 1) * limit).limit(limit),
        Booking.countDocuments(filter),
      ]);

      return res.json({ items, total, page, limit });
    }

    const list = await baseQuery;

    res.json(list);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load bookings" });
  }
};

/* ================= UPDATE STATUS ================= */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    req.app.get("io")?.emit("booking_status_updated", updated);

    res.json({
      success: true,
      booking: updated,
    });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================= DELETE BOOKING ================= */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }

    req.app.get("io")?.emit("booking_deleted", deleted);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= STATS (ADMIN) ================= */
export const getBookingStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    res.json({
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: "pending" }),
      confirmed: await Booking.countDocuments({ status: "confirmed" }),
      completed: await Booking.countDocuments({ status: "completed" }),
      today: await Booking.countDocuments({ date: today }),
    });
  } catch (err) {
    console.error("BOOKING STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load stats" });
  }
};

/* ================= BLOCKED SLOTS (PUBLIC) ================= */
export const getBlockedSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) return res.json([]);

    const slots = await Booking.find(
      { date, status: { $in: ["pending", "confirmed"] } },
      "time"
    );

    res.json(slots.map((s) => s.time));
  } catch (err) {
    console.error("GET BLOCKED SLOTS ERROR:", err);
    res.status(500).json({ message: "Failed to load slots" });
  }
};
