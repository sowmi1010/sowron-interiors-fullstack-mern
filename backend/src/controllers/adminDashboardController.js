import Booking from "../models/Booking.js";
import Estimate from "../models/Estimate.js";
import Portfolio from "../models/Portfolio.js";
import Feedback from "../models/Feedback.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const [
      totalBookings,
      totalEstimates,
      totalPortfolio,
      totalFeedback,
    ] = await Promise.all([
      Booking.countDocuments(),
      Estimate.countDocuments(),
      Portfolio.countDocuments(),
      Feedback.countDocuments(),
    ]);

    res.json({
      totalBookings,
      totalEstimates,
      totalPortfolio,
      totalFeedback,
    });
  } catch (err) {
    console.error("Dashboard count error:", err);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
