import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
import multer from "multer";

/* ===========================
   APP SETUP
=========================== */
const app = express();
const server = http.createServer(app);

/* ===========================
   SOCKET SETUP
=========================== */
const io = new Server(server, {
  cors: {
    origin: ["https://www.sowroninteriors.com", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

global._io = io;

io.on("connection", (socket) => {
  console.log("🔥 WebSocket Connected:", socket.id);
});

/* ===========================
   DIRNAME FIX
=========================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===========================
   SECURITY MIDDLEWARE
=========================== */
app.use(helmet());

app.use(cors({
  origin: ["https://www.sowroninteriors.com", "http://localhost:5173"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===========================
   RATE LIMITING
=========================== */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Please try again later.",
});

app.use(apiLimiter);

/* ===========================
   CONNECT DATABASE
=========================== */
connectDB();

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

/* ===========================
   TEST ROUTE
=========================== */
app.get("/", (req, res) => {
  res.json({ message: "Backend Working 🚀" });
});

/* ===========================
   USE ROUTES
=========================== */
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/otp", otpLimiter, otpRoutes);
app.use("/api/estimate", estimateRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);

/* ===========================
   GLOBAL ERROR HANDLER
=========================== */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Secure Server running on ${PORT}`);
});
