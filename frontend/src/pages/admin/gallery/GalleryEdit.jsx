import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, Save } from "lucide-react";

export default function GalleryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* 🔄 LOAD CATEGORIES */
  const loadCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  /* 🔄 LOAD GALLERY ITEM */
  const loadGallery = async () => {
    const res = await api.get(`/gallery/${id}`);
    const item = res.data;

    setTitle(item.title);
    setCategory(item.category);
    setOldImages(item.images || []);
  };

  useEffect(() => {
    Promise.all([loadCategories(), loadGallery()])
      .catch(() => {
        toast.error("Failed to load gallery");
        navigate("/admin/gallery");
      })
      .finally(() => setLoading(false));

    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /* 📸 NEW IMAGE PREVIEW (SAFE) */
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    preview.forEach((url) => URL.revokeObjectURL(url));

    setNewFiles(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  /* 💾 UPDATE */
  const submit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !category) {
      return toast.error("Title & category are required");
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("category", category);
      newFiles.forEach((f) => fd.append("images", f));

      await api.put(`/gallery/${id}`, fd);

      toast.success("Gallery updated successfully");
      navigate("/admin/gallery");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-20">
        Loading…
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-white p-6">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <ImagePlus /> Edit Gallery Item
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Update gallery details and images
        </p>
      </div>

      {/* CARD */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl p-6 shadow-glass">

        <form onSubmit={submit} className="space-y-4">

          {/* TITLE */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gallery title"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* EXISTING IMAGES */}
          {oldImages.length > 0 && (
            <>
              <p className="text-sm text-gray-400 mt-2">
                Existing Images
              </p>
              <div className="grid grid-cols-3 gap-3">
                {oldImages.map((img) => (
                  <img
                    key={img.public_id}
                    src={img.url}
                    alt="Gallery"
                    className="h-24 rounded-xl object-cover
                               border border-white/10"
                  />
                ))}
              </div>
            </>
          )}

          {/* NEW IMAGES */}
          <label className="block text-sm text-gray-400 mt-4">
            Replace Images
          </label>
          <input
            type="file"
            multiple
            onChange={handleFiles}
            className="text-sm"
          />

          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Preview"
                  className="h-24 rounded-xl object-cover
                             border border-white/10"
                />
              ))}
            </div>
          )}

          {/* SAVE */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg font-semibold
                       bg-brand-red text-white
                       hover:bg-brand-redDark transition
                       disabled:opacity-60
                       flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? "Updating..." : "Update Gallery"}
          </button>

        </form>
      </div>
    </div>
  );
}
