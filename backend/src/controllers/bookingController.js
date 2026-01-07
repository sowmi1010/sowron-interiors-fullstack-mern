import Booking from "../models/Booking.js";

/* ================= ADD BOOKING ================= */
export const addBooking = async (req, res) => {
  try {
    const { date, time, city } = req.body;
    const phone = req.user?.phone || req.body.phone;

    if (!date || !time || !city || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    const booking = await Booking.create({
      phone,
      date,
      time,
      city,
      status: "pending",
    });

    // 🔥 Live admin update
    global._io?.emit("new_booking", booking);

    res.status(201).json({ success: true, booking });

  } catch (err) {
    // 🔥 SLOT ALREADY BOOKED (MongoDB Atlas)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Selected slot already booked",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

/* ================= GET BOOKINGS (ADMIN) ================= */
export const getBookings = async (req, res) => {
  try {
    const { status, date } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;

    const list = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE STATUS ================= */
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    global._io?.emit("booking_status_updated", updated);

    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= STATS ================= */
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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
};
