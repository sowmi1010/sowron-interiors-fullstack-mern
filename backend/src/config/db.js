import mongoose from "mongoose";
import dns from "dns";

const configureDnsServers = () => {
  const raw = process.env.DNS_SERVERS;
  if (!raw) return;

  // This workaround is mainly for local Windows development.
  // Skip it in hosted Linux environments unless explicitly enabled.
  const forceCustomDns = process.env.FORCE_CUSTOM_DNS === "true";
  if (process.platform !== "win32" && !forceCustomDns) return;

  const servers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!servers.length) return;
  dns.setServers(servers);
};

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not configured");
  }

  if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
    configureDnsServers();
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

/* ===========================
   CONNECTION EVENTS
=========================== */
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

/* ===========================
   GRACEFUL SHUTDOWN
=========================== */
const shutdown = async (signal) => {
  console.log(`${signal} received. Closing MongoDB...`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
