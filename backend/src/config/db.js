import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Stop server if DB fails
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

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB disconnected on app termination");
  process.exit(0);
});
