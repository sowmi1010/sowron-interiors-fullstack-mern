import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not configured");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false, // ✅ better for production
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

/* ===========================
   CONNECTION EVENTS
=========================== */
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 MongoDB disconnected");
});

/* ===========================
   GRACEFUL SHUTDOWN
=========================== */
const shutdown = async (signal) => {
  console.log(`🛑 ${signal} received. Closing MongoDB...`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
