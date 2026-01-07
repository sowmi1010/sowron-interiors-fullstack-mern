import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const adminEmail = "tamilsowmi1010@gmail.com";
    const adminPassword = "123456";

    const exists = await User.findOne({ email: adminEmail });
    if (exists) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    await User.create({
      name: "Administrator",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log("🎉 Admin created");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

run();
