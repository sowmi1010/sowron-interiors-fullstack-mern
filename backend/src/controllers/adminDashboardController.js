import Booking from "../models/Booking.js";
import Estimate from "../models/Estimate.js";
import Portfolio from "../models/Portfolio.js";
import Feedback from "../models/Feedback.js";
import Category from "../models/Category.js";
import Enquiry from "../models/Enquiry.js";
import Gallery from "../models/Gallery.js";

export const getDashboardCounts = async (req, res) => {
  try {
    const now = new Date();
    const start7 = new Date(now);
    start7.setDate(start7.getDate() - 7);
    const start14 = new Date(now);
    start14.setDate(start14.getDate() - 14);

    const [
      totalBookings,
      totalEstimates,
      totalPortfolio,
      totalFeedback,
      totalEnquiries,
      totalCategories,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentBookings,
      recentEnquiries,
      recentEstimates,
      topCities,
      topCategories,
      bookingsLast7,
      bookingsPrev7,
      enquiriesLast7,
      enquiriesPrev7,
      estimatesLast7,
      estimatesPrev7,
    ] = await Promise.all([
      Booking.countDocuments(),
      Estimate.countDocuments(),
      Portfolio.countDocuments(),
      Feedback.countDocuments(),
      Enquiry.countDocuments(),
      Category.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.find().sort({ createdAt: -1 }).limit(5).select("phone city date time status createdAt"),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).select("name phone city projectTitle createdAt status"),
      Estimate.find().sort({ createdAt: -1 }).limit(5).select("name phone city budget status createdAt"),
      Booking.aggregate([
        { $match: { city: { $exists: true, $ne: "" } } },
        { $group: { _id: { $toLower: "$city" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Gallery.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Booking.countDocuments({ createdAt: { $gte: start7 } }),
      Booking.countDocuments({ createdAt: { $gte: start14, $lt: start7 } }),
      Enquiry.countDocuments({ createdAt: { $gte: start7 } }),
      Enquiry.countDocuments({ createdAt: { $gte: start14, $lt: start7 } }),
      Estimate.countDocuments({ createdAt: { $gte: start7 } }),
      Estimate.countDocuments({ createdAt: { $gte: start14, $lt: start7 } }),
    ]);

    const categoryIds = topCategories.map((c) => c._id).filter(Boolean);
    const categoryMap = new Map(
      (await Category.find({ _id: { $in: categoryIds } }).select("name")).map((c) => [String(c._id), c.name])
    );

    const topCategoryData = topCategories.map((c) => ({
      id: c._id,
      name: categoryMap.get(String(c._id)) || "Unknown",
      count: c.count,
    }));

    const topCityData = topCities.map((c) => ({
      city: c._id,
      count: c.count,
    }));

    const activity = [
      ...recentBookings.map((b) => ({
        type: "booking",
        label: "New booking",
        city: b.city,
        status: b.status,
        createdAt: b.createdAt,
      })),
      ...recentEnquiries.map((e) => ({
        type: "enquiry",
        label: "New enquiry",
        name: e.name,
        city: e.city,
        project: e.projectTitle,
        status: e.status,
        createdAt: e.createdAt,
      })),
      ...recentEstimates.map((e) => ({
        type: "estimate",
        label: "New estimate",
        name: e.name,
        city: e.city,
        status: e.status,
        createdAt: e.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    const trend = (current, previous) => {
      if (previous === 0) return { current, previous, change: current > 0 ? 100 : 0 };
      const change = ((current - previous) / previous) * 100;
      return { current, previous, change: Math.round(change) };
    };

    res.json({
      success: true,
      counts: {
        bookings: totalBookings,
        estimates: totalEstimates,
        portfolio: totalPortfolio,
        feedback: totalFeedback,
        enquiries: totalEnquiries,
        categories: totalCategories,
      },
      bookingStatus: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      topCities: topCityData,
      topCategories: topCategoryData,
      activity,
      trends: {
        bookings: trend(bookingsLast7, bookingsPrev7),
        enquiries: trend(enquiriesLast7, enquiriesPrev7),
        estimates: trend(estimatesLast7, estimatesPrev7),
      },
    });
  } catch (err) {
    console.error("DASHBOARD COUNT ERROR:", err);
    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
