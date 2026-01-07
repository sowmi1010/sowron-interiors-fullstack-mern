// src/pages/admin/portfolio/PortfolioEdit.jsx
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Helmet } from "react-helmet";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function PortfolioEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    video: "",
  });

  const [oldImages, setOldImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    api
      .get(`/portfolio/${id}`)
      .then((res) => {
        setForm({
          title: res.data.title || "",
          location: res.data.location || "",
          description: res.data.description || "",
          video: res.data.video || "",
        });
        setOldImages(res.data.images || []);
      })
      .catch(() => toast.error("Failed to load portfolio"));
  }, [id]);

  /* ================= IMAGE PICK ================= */
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        return toast.error("Only image files allowed");
      }
      if (file.size > MAX_SIZE) {
        return toast.error("Each image must be under 5MB");
      }
    }

    setNewFiles(selected);
    setPreview(selected.map((f) => URL.createObjectURL(f)));
  };

  /* 🔥 CLEAN PREVIEW MEMORY */
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  /* ================= SAVE ================= */
  const save = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.title.trim()) {
      return toast.error("Title is required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("location", form.location.trim());
      fd.append("description", form.description.trim());
      if (form.video) fd.append("video", form.video);

      // 🔥 Replace images only if new ones selected
      newFiles.forEach((file) => fd.append("images", file));

      await api.put(`/portfolio/${id}`, fd);

      toast.success("Portfolio updated ✔");
      navigate("/admin/portfolio");
    } catch (err) {
      console.error("PORTFOLIO UPDATE ERROR:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white flex justify-center">
      <Helmet>
        <title>Edit Portfolio</title>
      </Helmet>

      <div className="w-full max-w-3xl bg-[#141414]
                      border border-[#262626]
                      rounded-xl p-8">

        <h2 className="text-2xl font-bold text-[#ff6b00] mb-6">
          Edit Portfolio
        </h2>

        <form onSubmit={save} className="space-y-4">
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="Project Title"
            className="w-full bg-[#1a1a1a] border border-[#333]
                       p-3 rounded-lg"
          />

          <input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            placeholder="Location"
            className="w-full bg-[#1a1a1a] border border-[#333]
                       p-3 rounded-lg"
          />

          <textarea
            rows="4"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Description"
            className="w-full bg-[#1a1a1a] border border-[#333]
                       p-3 rounded-lg resize-none"
          />

          <input
            value={form.video}
            onChange={(e) =>
              setForm({ ...form, video: e.target.value })
            }
            placeholder="Video URL (optional)"
            className="w-full bg-[#1a1a1a] border border-[#333]
                       p-3 rounded-lg"
          />

          {/* ================= OLD IMAGES ================= */}
          {oldImages.length > 0 && (
            <>
              <p className="text-gray-400">Current Images</p>
              <div className="grid grid-cols-4 gap-2">
                {oldImages.map((img) => (
                  <img
                    key={img.public_id}
                    src={img.url}
                    alt="portfolio"
                    className="h-20 object-cover rounded border"
                  />
                ))}
              </div>
            </>
          )}

          {/* ================= NEW UPLOAD ================= */}
          <label className="border border-[#333] rounded-lg p-4
                            flex flex-col items-center gap-2
                            cursor-pointer">
            <Upload size={20} />
            Replace Images (optional)
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleFiles}
            />
          </label>

          {preview.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-20 rounded border object-cover"
                  alt="preview"
                />
              ))}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#ff6b00] py-3 rounded-lg
                       text-black font-semibold
                       hover:bg-[#ff7b13]
                       disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
