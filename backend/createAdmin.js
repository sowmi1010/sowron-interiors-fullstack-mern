import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await User.deleteMany({ role: "admin" });

await User.create({
  name: "Administrator",
  email: "tamilsowmi1010@gmail.com",
  phone: "9999999999",
  password: "Admin@123",
  role: "admin",
});

console.log("✅ Admin ready");
process.exit(0);
