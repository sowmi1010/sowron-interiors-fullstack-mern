import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
import multer from "multer";



const app = express();

/* ===========================
   HTTP + SOCKET
=========================== */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
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
   MIDDLEWARE (ORDER IS CRITICAL)
=========================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚠️ KEEP uploads ONLY if you still want local images (optional)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ===========================
   ENV CHECK
=========================== */
console.log("ENV CHECK:", {
  mongo: !!process.env.MONGO_URI,
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
});

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
app.use("/api/otp", otpRoutes);
app.use("/api/estimate", estimateRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);

/* ===========================
   🔥 GLOBAL ERROR HANDLER (VERY IMPORTANT)
=========================== */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  // Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Cloudinary / other errors
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running with WebSockets on ${PORT}`);
});
