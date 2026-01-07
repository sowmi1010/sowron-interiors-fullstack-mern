import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

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

  /* 🔄 LOAD GALLERY */
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
      <p className="text-center text-gray-400">
        Loading…
      </p>
    );
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl text-[#ff6b00] font-bold mb-6">
        Edit Gallery Item
      </h2>

      <form
        onSubmit={submit}
        className="bg-[#1a1a1a] p-6 border rounded max-w-xl mx-auto space-y-3"
      >
        <input
          className="bg-[#141414] border p-2 w-full rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <select
          className="bg-[#141414] border p-2 w-full rounded"
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

        {/* EXISTING IMAGES */}
        {oldImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {oldImages.map((img) => (
              <img
                key={img.public_id}
                src={img.url}
                alt="Gallery"
                className="h-20 rounded border object-cover"
              />
            ))}
          </div>
        )}

        {/* NEW IMAGES */}
        <input
          type="file"
          multiple
          className="bg-[#141414] border p-2 w-full rounded"
          onChange={handleFiles}
        />

        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {preview.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Preview"
                className="h-20 rounded object-cover"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#ff6b00] text-black px-4 py-2 rounded w-full font-semibold disabled:opacity-70"
        >
          {saving ? "Updating..." : "Update"}
        </button>
      </form>
    </div>
  );
}
