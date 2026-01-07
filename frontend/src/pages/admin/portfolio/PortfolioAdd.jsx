import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function PortfolioAdd() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
  });

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE PICK ================= */
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);

    setFiles(selected);
    setPreview(selected.map((f) => URL.createObjectURL(f)));
  };

  /* 🔥 CLEAN PREVIEW URLS (MEMORY SAFE) */
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return toast.error("Project title is required");
    }

    if (files.length === 0) {
      return toast.error("At least one image is required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("location", form.location);
      fd.append("description", form.description);

      files.forEach((file) => {
        fd.append("images", file); // 🔥 MUST MATCH backend
      });

      await api.post("/portfolio/add", fd);

      toast.success("Portfolio added successfully ✔");
      navigate("/admin/portfolio");
    } catch (err) {
      console.error("PORTFOLIO ADD ERROR:", err);
      toast.error(
        err.response?.data?.message || "Portfolio upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <Helmet>
        <title>Add Portfolio</title>
      </Helmet>

      <h2 className="text-3xl font-bold text-[#ff6b00] text-center mb-8">
        Add Completed Project
      </h2>

      <form
        onSubmit={submitHandler}
        className="bg-[#121212] border border-[#272727] rounded-xl
                   max-w-4xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* LEFT */}
        <div className="space-y-4">
          <input
            placeholder="Project Title"
            className="bg-[#0d0d0d] border border-[#333] p-3 rounded-lg w-full"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            placeholder="Location (optional)"
            className="bg-[#0d0d0d] border border-[#333] p-3 rounded-lg w-full"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />

          <textarea
            rows="4"
            placeholder="Short description"
            className="bg-[#0d0d0d] border border-[#333] p-3 rounded-lg w-full resize-none"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        {/* RIGHT */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
          <label className="flex flex-col items-center gap-3 cursor-pointer">
            <UploadCloud size={40} className="text-[#ff6b00]" />
            <span className="text-gray-300">Upload Images</span>

            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleFiles}
            />
          </label>

          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-20 w-full object-cover rounded border"
                  alt="preview"
                />
              ))}
            </div>
          )}
        </div>

        <button
          disabled={loading}
          type="submit"
          className="bg-[#ff6b00] text-black py-3 rounded-lg font-semibold
                     col-span-2 hover:bg-[#ff7b13] disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Portfolio"}
        </button>
      </form>
    </div>
  );
}
