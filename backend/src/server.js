import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

const app = express();
const server = http.createServer(app);

/* ===========================
   TRUST PROXY (Render)
=========================== */
app.set("trust proxy", 1);

/* ===========================
   ALLOWED ORIGINS
=========================== */
const allowedOrigins = [
  "https://sowron-interiors.netlify.app",
  "https://sowron.com",
  "https://www.sowron.com",
  "http://localhost:5173"
];

/* ===========================
   MIDDLEWARE
=========================== */
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===========================
   SECURITY PROTECTION
=========================== */
app.use(mongoSanitize());
app.use(xss());

/* ===========================
   CORS CONFIG
=========================== */
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

/* ===========================
   RATE LIMIT
=========================== */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

/* ===========================
   DATABASE
=========================== */
connectDB();

/* ===========================
   SOCKET.IO
=========================== */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Socket service
app.set("io", io);

/* ===========================
   ROUTES
=========================== */
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import estimateRoutes from "./routes/estimateRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

/* ===========================
   HEALTH CHECK
=========================== */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

/* ===========================
   TEST ROUTE
=========================== */
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend Working 🚀" });
});

/* ===========================
   API ROUTES
=========================== */
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes); // fixed duplicate
app.use("/api/products", productRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/estimate", estimateRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);


/* ===========================
   404 HANDLER
=========================== */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ===========================
   GLOBAL ERROR HANDLER
=========================== */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

process.on("SIGTERM", () => server.close());


/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
