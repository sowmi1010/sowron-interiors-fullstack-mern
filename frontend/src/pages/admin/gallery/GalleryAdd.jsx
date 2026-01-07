import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function GalleryAdd() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🔄 LOAD CATEGORIES */
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));

    return () => {
      // 🧹 CLEAN PREVIEW MEMORY
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* 📸 IMAGE PICK (MEMORY SAFE) */
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);

    preview.forEach((url) => URL.revokeObjectURL(url));

    setFiles(selected);
    setPreview(selected.map((f) => URL.createObjectURL(f)));
  };

  /* ❌ REMOVE SELECTED IMAGE */
  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index]);

    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  /* ➕ SUBMIT */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!title.trim() || !category || files.length === 0) {
      return toast.error("Title, category & images are required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category); // must match backend
      files.forEach((file) => fd.append("images", file));

      await api.post("/gallery/add", fd);

      toast.success("Gallery item added successfully");
      navigate("/admin/gallery");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-8 text-white">
      <Helmet>
        <title>Add Gallery</title>
      </Helmet>

      <div className="bg-[#151515] border border-[#262626]
                      p-8 rounded-xl shadow-xl w-full max-w-xl">

        <h2 className="text-3xl font-bold text-[#ff6b00] mb-6">
          Add Gallery Item
        </h2>

        <form onSubmit={submitHandler} className="space-y-4">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Enter Title"
            className="bg-[#1b1b1b] border border-[#333] p-3 rounded w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* CATEGORY */}
          <select
            className="bg-[#1a1a1a] border border-[#333] p-3 rounded w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* IMAGE PICKER */}
          <label className="border border-[#333] rounded-lg bg-[#1a1a1a]
                            p-4 flex items-center gap-3 cursor-pointer">
            <Upload size={20} /> Select Images
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleFiles}
            />
          </label>

          {/* PREVIEW */}
          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {preview.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt="Preview"
                    className="rounded h-24 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60
                               text-white p-1 rounded opacity-0
                               group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff6b00] w-full py-3 rounded
                       text-black font-semibold disabled:opacity-70"
          >
            {loading ? "Uploading..." : "Save Gallery"}
          </button>
        </form>
      </div>
    </div>
  );
}
