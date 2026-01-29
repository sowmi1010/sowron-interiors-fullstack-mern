import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

/* ===========================
   APP & SERVER
=========================== */
const app = express();
const server = http.createServer(app);

/* ===========================
   TRUST PROXY (Render / Nginx)
=========================== */
app.set("trust proxy", 1);

/* ===========================
   ALLOWED ORIGINS
=========================== */
const allowedOrigins = [
  "https://sowron-interiors.netlify.app",
  "https://sowron.com",
  "https://www.sowron.com",
  "http://localhost:5173",
];

/* ===========================
   SECURITY MIDDLEWARE
=========================== */
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===========================
   GLOBAL RATE LIMIT
=========================== */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // safe default
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ===========================
   DATABASE
=========================== */
connectDB();

/* ===========================
   SOCKET.IO (Future Chatbot Ready)
=========================== */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/* ===========================
   ROUTES
=========================== */
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import estimateRoutes from "./routes/estimateRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

/* ===========================
   TEST ROUTE
=========================== */
app.get("/api/test", (req, res) => {
  res.status(200).json({ success: true, message: "Backend Working 🚀" });
});

/* ===========================
   API ROUTES
=========================== */
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/estimate", estimateRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);

/* ===========================
   GLOBAL ERROR HANDLER
=========================== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
