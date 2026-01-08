// src/pages/admin/portfolio/PortfolioEdit.jsx
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Briefcase, Save } from "lucide-react";
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
      newFiles.forEach((file) => fd.append("images", file));

      await api.put(`/portfolio/${id}`, fd);

      toast.success("Portfolio updated successfully");
      navigate("/admin/portfolio");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-white p-6">
      <Helmet>
        <title>Edit Portfolio</title>
      </Helmet>

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <Briefcase /> Edit Portfolio Project
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Update project details and visuals
        </p>
      </div>

      {/* CARD */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl p-8 shadow-glass">

        <form onSubmit={save} className="space-y-4">

          {/* TITLE */}
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="Project Title"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* LOCATION */}
          <input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            placeholder="Location"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* DESCRIPTION */}
          <textarea
            rows="4"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Description"
            className="w-full px-4 py-3 rounded-lg resize-none
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* VIDEO */}
          <input
            value={form.video}
            onChange={(e) =>
              setForm({ ...form, video: e.target.value })
            }
            placeholder="Video URL (optional)"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* CURRENT IMAGES */}
          {oldImages.length > 0 && (
            <>
              <p className="text-sm text-gray-400 mt-2">
                Current Images
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {oldImages.map((img) => (
                  <img
                    key={img.public_id}
                    src={img.url}
                    alt="portfolio"
                    className="h-24 rounded-xl object-cover
                               border border-white/10"
                  />
                ))}
              </div>
            </>
          )}

          {/* NEW UPLOAD */}
          <label className="mt-4 flex flex-col items-center gap-2
                            border border-dashed border-white/20
                            rounded-xl py-6 cursor-pointer
                            hover:border-brand-yellow transition">
            <Upload size={24} className="text-brand-red" />
            <span className="text-sm text-gray-300">
              Replace Images (optional)
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleFiles}
            />
          </label>

          {preview.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="preview"
                  className="h-24 rounded-xl object-cover
                             border border-white/10"
                />
              ))}
            </div>
          )}

          {/* SAVE */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 rounded-lg font-semibold
                       bg-brand-red text-white
                       hover:bg-brand-redDark transition
                       disabled:opacity-50
                       flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
