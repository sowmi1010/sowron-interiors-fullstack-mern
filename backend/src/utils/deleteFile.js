import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safely delete a file if it exists
 * @param {string} filePath - like "/uploads/feedback/xxx.jpg"
 */
export const deleteFile = (filePath) => {
  try {
    if (!filePath) return;

    const fullPath = path.join(__dirname, "..", "..", filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("🗑️ Deleted file:", fullPath);
    }
  } catch (err) {
    console.error("FILE DELETE ERROR:", err.message);
  }
};
