import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/* ✅ File validation */
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const estimateFileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isPdf = file.mimetype === "application/pdf";
  if (!isImage && !isPdf) {
    return cb(new Error("Only image or PDF files are allowed"), false);
  }
  cb(null, true);
};

/* ✅ Dynamic uploader (REUSABLE) */
export const getUploader = (folder, options = {}) => {
  const {
    resourceType = "image",
    format = "webp",
    fileFilter = imageFileFilter,
    fileSize = 5 * 1024 * 1024,
  } = options;

  return multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder,
        resource_type: resourceType,
        ...(format ? { format } : {}),
      },
    }),
    fileFilter,
    limits: {
      fileSize,
    },
  });
};

export const getEstimateUploader = (folder) =>
  getUploader(folder, {
    resourceType: "auto",
    format: null,
    fileFilter: estimateFileFilter,
    fileSize: 10 * 1024 * 1024,
  });
