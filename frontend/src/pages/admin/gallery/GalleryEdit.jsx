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
  const [loading, setLoading] = useState(true);

  /* LOAD CATEGORIES */
  const loadCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  /* LOAD GALLERY */
  const loadGallery = async () => {
    const res = await api.get(`/gallery/item/${id}`);
    const item = res.data.item;

    setTitle(item.title);
    setCategory(item.category);
    setOldImages(item.images || []);
  };

  useEffect(() => {
    Promise.all([loadCategories(), loadGallery()]).finally(() =>
      setLoading(false)
    );
  }, []);

  /* UPDATE */
  const submit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("category", category);
      newFiles.forEach((f) => fd.append("images", f));

      await api.put(`/gallery/${id}`, fd);

      toast.success("Gallery updated ✔");
      navigate("/admin/gallery");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="text-center text-gray-400">Loading…</p>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl text-[#ff6b00] font-bold mb-6">
        Edit Gallery Item
      </h2>

      <form
        onSubmit={submit}
        className="bg-[#1a1a1a] p-6 border rounded max-w-xl mx-auto"
      >
        <input
          className="bg-[#141414] border p-2 w-full mb-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="bg-[#141414] border p-2 w-full mb-3 rounded"
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {oldImages.map((img) => (
            <img
              key={img.public_id}
              src={img.url}
              className="h-20 rounded border object-cover"
            />
          ))}
        </div>

        <input
          type="file"
          multiple
          className="bg-[#141414] border p-2 w-full rounded mb-4"
          onChange={(e) => setNewFiles([...e.target.files])}
        />

        <button className="bg-[#ff6b00] text-black px-4 py-2 rounded w-full font-semibold">
          Update
        </button>
      </form>
    </div>
  );
}
