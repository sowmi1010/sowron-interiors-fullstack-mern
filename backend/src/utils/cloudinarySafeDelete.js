import cloudinary from "../config/cloudinary.js";

export const deleteImagesSafely = async (images = []) => {
  const failed = [];

  for (const img of images) {
    if (!img?.public_id) continue;

    try {
      const res = await cloudinary.uploader.destroy(img.public_id);
      if (res.result !== "ok") {
        failed.push(img.public_id);
      }
    } catch {
      failed.push(img.public_id);
    }
  }

  return failed; // empty = safe
};
