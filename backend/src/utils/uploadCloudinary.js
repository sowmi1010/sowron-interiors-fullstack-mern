import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "sowron-interiors/products", // 🔁 change per module
      resource_type: "image",
      format: "webp", // 🔥 auto optimize
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

export const uploadCloudinary = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
