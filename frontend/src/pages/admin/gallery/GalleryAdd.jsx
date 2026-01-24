import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Upload, X, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function GalleryAdd() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(""); // ✅ FIX
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
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* 📸 IMAGE PICK */
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    preview.forEach((url) => URL.revokeObjectURL(url));

    setFiles(selected);
    setPreview(selected.map((f) => URL.createObjectURL(f)));
  };

  /* ❌ REMOVE IMAGE */
  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  /* ➕ SUBMIT */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!title.trim() || !categoryId || files.length === 0) {
      return toast.error("Title, category & images are required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("categoryId", categoryId); // ✅ FIX
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
    <div className="max-w-2xl mx-auto text-white p-6">
      <Helmet>
        <title>Add Gallery</title>
      </Helmet>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <ImagePlus /> Add Gallery Item
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload and organize gallery visuals
        </p>
      </div>

      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-glass">
        <form onSubmit={submitHandler} className="space-y-4">

          <input
            type="text"
            placeholder="Gallery title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 outline-none"
          />

          {/* ✅ CATEGORY FIX */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-white/10 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* IMAGE PICKER */}
          <label className="flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl bg-black py-6 cursor-pointer">
            <Upload size={20} />
            <span className="text-sm text-gray-300">
              Click to select images
            </span>
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
            <div className="grid grid-cols-3 gap-3 mt-4">
              {preview.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden">
                  <img src={src} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold bg-brand-red text-white"
          >
            {loading ? "Uploading..." : "Save Gallery"}
          </button>
        </form>
      </div>
    </div>
  );
}
