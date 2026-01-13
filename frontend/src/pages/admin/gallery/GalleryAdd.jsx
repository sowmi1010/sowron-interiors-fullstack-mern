import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Upload, X, ImagePlus } from "lucide-react";
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

  /* ❌ REMOVE IMAGE */
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
      fd.append("category", category);
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

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <ImagePlus /> Add Gallery Item
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Upload and organize gallery visuals
        </p>
      </div>

      {/* CARD */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl p-6 shadow-glass">

        <form onSubmit={submitHandler} className="space-y-4">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Gallery title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg
                       bg-black border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg
                       bg-black border border-white/10
                       outline-none focus:border-brand-yellow transition"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* IMAGE PICKER */}
          <label className="flex items-center justify-center gap-2
                            border border-dashed border-white/20
                            rounded-xl bg-black py-6
                            cursor-pointer hover:border-brand-yellow
                            transition">
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
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden
                             border border-white/10"
                >
                  <img
                    src={src}
                    alt="Preview"
                    className="h-24 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2
                               bg-black/70 p-1.5 rounded-full
                               opacity-0 group-hover:opacity-100
                               transition"
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
            className="w-full py-3 rounded-lg font-semibold
                       bg-brand-red text-white
                       hover:bg-brand-redDark transition
                       disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Save Gallery"}
          </button>

        </form>
      </div>
    </div>
  );
}
