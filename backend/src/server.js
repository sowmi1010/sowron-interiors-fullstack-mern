import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
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

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const defaultOrigins = [
  "http://localhost:5173",
  "https://sowron-interiors-fullstack-mern.pages.dev",
  "https://sowron.com",
  "https://www.sowron.com",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

connectDB();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

app.get("/api/test", (req, res) => {
  res.status(200).json({ success: true, message: "Backend working" });
});

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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
