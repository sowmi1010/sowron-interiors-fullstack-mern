import dotenv from "dotenv";
dotenv.config(); // ✅ MUST BE FIRST

import { v2 as cloudinary } from "cloudinary";

console.log("☁️ CLOUDINARY CONFIG FILE LOADED");
console.log("☁️ CLOUDINARY ENV:", {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: !!process.env.CLOUDINARY_API_SECRET,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
