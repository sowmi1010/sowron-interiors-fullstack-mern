import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./src/models/Admin.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const email = process.env.ADMIN_EMAIL || "tamilsowmi1010@gmail.com";
const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
const name = process.env.ADMIN_NAME || "Administrator";
const phone = process.env.ADMIN_PHONE || "";

const existing = await Admin.findOne({ email: email.toLowerCase() });
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

console.log("✅ Admin ready:", email);
process.exit(0);
