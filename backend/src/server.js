import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";

/* ===========================
   APP & SERVER
=========================== */
const app = express();
const server = http.createServer(app);

/* ===========================
   TRUST PROXY (CLOUDFLARE)
=========================== */
app.set("trust proxy", 1);

/* ===========================
   SECURITY
=========================== */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

/* ===========================
   LOGGING
=========================== */
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

/* ===========================
   CORS (EXPRESS 5 SAFE)
=========================== */
const defaultCorsOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://sowron-interiors-fullstack-mern.pages.dev",
  "https://sowron.com",
  "https://www.sowron.com",
];

const normalizeOrigin = (value) => value.replace(/\/+$/, "");

const envCorsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const allowlistedOrigins = new Set(
  (envCorsOrigins.length ? envCorsOrigins : defaultCorsOrigins).map(
    normalizeOrigin
  )
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser clients (health checks, curl, etc.)

  const normalized = normalizeOrigin(origin);
  if (allowlistedOrigins.has(normalized)) return true;

  // Cloudflare Pages preview deployments are often on subdomains.
  return /^https:\/\/([a-z0-9-]+\.)?sowron-interiors-fullstack-mern\.pages\.dev$/i.test(
    normalized
  );
};

const corsOptions = {
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/* ===========================
   BODY & COOKIES
=========================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===========================
   RATE LIMIT
=========================== */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

/* ===========================
   DATABASE
=========================== */
connectDB();

/* ===========================
   SOCKET.IO
=========================== */
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
    credentials: true,
    methods: ["GET", "POST"],
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
   HEALTH CHECK
=========================== */
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Working 🚀",
  });
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
  console.error("❌ Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
