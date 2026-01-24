import Booking from "../models/Booking.js";
import Estimate from "../models/Estimate.js";
import Portfolio from "../models/Portfolio.js";
import Feedback from "../models/Feedback.js";
import Enquiry from "../models/Enquiry.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const [
      totalBookings,
      totalEstimates,
      totalPortfolio,
      totalFeedback,
      totalEnquiries,
      totalProducts,
      totalCategories,
    ] = await Promise.all([
      Booking.countDocuments(),
      Estimate.countDocuments(),
      Portfolio.countDocuments(),
      Feedback.countDocuments(),
      Enquiry.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
    ]);

    res.json({
      success: true,
      counts: {
        bookings: totalBookings,
        estimates: totalEstimates,
        portfolio: totalPortfolio,
        feedback: totalFeedback,
        enquiries: totalEnquiries,
        products: totalProducts,
        categories: totalCategories,
      },
    });
  } catch (err) {
    console.error("DASHBOARD COUNT ERROR:", err);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
