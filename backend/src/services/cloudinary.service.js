import cloudinary from "../config/cloudinary.js";

/* DELETE SINGLE */
export const deleteImage = async (public_id) => {
  try {
    if (!public_id) return;
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Cloudinary delete failed:", public_id);
  }
};

/* DELETE MULTIPLE */
export const deleteMultipleImages = async (images = []) => {
  if (!images.length) return;

  await Promise.allSettled(
    images.map((img) => deleteImage(img.public_id))
  );
};
