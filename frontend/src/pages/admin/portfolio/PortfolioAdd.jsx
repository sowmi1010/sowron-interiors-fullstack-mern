import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { UploadCloud, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function PortfolioAdd() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    video: "",
  });

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE PICK ================= */
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        return toast.error("Only image files are allowed");
      }
      if (file.size > MAX_SIZE) {
        return toast.error("Each image must be under 5MB");
      }
    }

    setFiles(selected);
    setPreview(selected.map((f) => URL.createObjectURL(f)));
  };

  /* 🔥 CLEAN PREVIEW URLS */
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.title.trim()) {
      return toast.error("Project title is required");
    }

    if (files.length === 0) {
      return toast.error("At least one image is required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("location", form.location.trim());
      fd.append("description", form.description.trim());
      if (form.video) fd.append("video", form.video);
      files.forEach((file) => fd.append("images", file));

      await api.post("/portfolio/add", fd);

      toast.success("Portfolio added successfully");
      navigate("/admin/portfolio");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-white p-6">
      <Helmet>
        <title>Add Portfolio</title>
      </Helmet>

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <Briefcase /> Add Portfolio Project
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Showcase completed interior projects
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={submitHandler}
        className="bg-black/60 backdrop-blur-xl
                   border border-white/10
                   rounded-2xl p-8 shadow-glass
                   grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <input
            placeholder="Project Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          <input
            placeholder="Location (optional)"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          <textarea
            rows="4"
            placeholder="Short description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg resize-none
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          <input
            placeholder="Video URL (optional)"
            value={form.video}
            onChange={(e) =>
              setForm({ ...form, video: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="bg-white/5 border border-white/10
                        rounded-xl p-6 flex flex-col justify-center">
          <label className="flex flex-col items-center gap-3
                            cursor-pointer hover:text-brand-yellow transition">
            <UploadCloud size={42} className="text-brand-red" />
            <span className="text-sm text-gray-300">
              Click to upload images
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
            <div className="grid grid-cols-3 gap-3 mt-5">
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
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          type="submit"
          className="col-span-1 lg:col-span-2
                     py-3 rounded-lg font-semibold
                     bg-brand-red text-white
                     hover:bg-brand-redDark transition
                     disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Portfolio"}
        </button>
      </form>
    </div>
  );
}
