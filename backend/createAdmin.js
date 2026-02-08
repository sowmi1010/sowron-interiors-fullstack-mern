import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Admin from "./src/models/Admin.js";

dotenv.config({ quiet: true });

// Fix for some Windows networks where Node's DNS (c-ares) can't resolve SRV records
// for mongodb+srv (Atlas). Only applies to this Node process.
if (
  process.env.MONGO_URI?.startsWith("mongodb+srv://") &&
  process.env.DNS_SERVERS
) {
  const servers = process.env.DNS_SERVERS
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

const requireEnv = (key) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

try {
  const mongoUri = requireEnv("MONGO_URI");
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("ADMIN_PASSWORD");
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const phone = process.env.ADMIN_PHONE?.trim() || "";

  if (!isEmail(email)) {
    throw new Error("ADMIN_EMAIL is invalid");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await mongoose.connect(mongoUri);

  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.phone = phone;
    existing.password = password;
    await existing.save();
  } else {
    await Admin.create({
      name,
      email,
      phone,
      password,
    });
  }

  console.log(`Admin ready: ${email}`);
  process.exit(0);
} catch (error) {
  console.error("createAdmin failed:", error.message);
  process.exit(1);
}
