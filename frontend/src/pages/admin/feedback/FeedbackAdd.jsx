import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { X } from "lucide-react";

const TN_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Tirunelveli",
  "Salem",
  "Erode",
  "Vellore",
  "Nilgiris",
  "Others",
];

export default function FeedbackAdd() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    city: "",
    rating: "",
    message: "",
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🧹 CLEAN PREVIEW MEMORY */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* 📸 PHOTO PICK */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ➕ SUBMIT */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.city || !form.rating) {
      return toast.error("Name, City & Rating are required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("city", form.city);
      fd.append("rating", Number(form.rating)); // ✅ send number
      fd.append("message", form.message.trim());

      if (photo) fd.append("photo", photo);

      await api.post("/feedback/add", fd);

      toast.success("Feedback added successfully");
      navigate("/admin/feedback");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold text-[#ff6b00] text-center mb-6">
        Add Feedback
      </h2>

      <form
        onSubmit={submit}
        className="bg-[#1a1a1a] p-6 rounded-xl mx-auto max-w-xl
                   border border-[#272727] space-y-4"
      >
        <input
          placeholder="Customer Name"
          className="bg-[#141414] border p-3 w-full rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <select
          className="bg-[#141414] border p-3 w-full rounded text-gray-300"
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
        >
          <option value="">Select City</option>
          {TN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="bg-[#141414] border p-3 w-full rounded text-gray-300"
          value={form.rating}
          onChange={(e) =>
            setForm({ ...form, rating: e.target.value })
          }
        >
          <option value="">Rating</option>
          <option value="5">⭐ 5 – Excellent</option>
          <option value="4">⭐ 4 – Good</option>
          <option value="3">⭐ 3 – Average</option>
          <option value="2">⭐ 2 – Poor</option>
          <option value="1">⭐ 1 – Very Poor</option>
        </select>

        <textarea
          placeholder="Message (optional)"
          className="bg-[#141414] border p-3 w-full rounded min-h-[90px]"
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
        />

        {/* PHOTO */}
        <input
          type="file"
          accept="image/*"
          className="bg-[#141414] border p-3 w-full rounded"
          onChange={handlePhoto}
        />

        {/* PREVIEW */}
        {preview && (
          <div className="relative w-28 h-28">
            <img
              src={preview}
              alt="Preview"
              className="rounded object-cover w-full h-full border"
            />
            <button
              type="button"
              onClick={() => {
                URL.revokeObjectURL(preview);
                setPreview(null);
                setPhoto(null);
              }}
              className="absolute -top-2 -right-2 bg-black/70 p-1 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <button
          disabled={loading}
          className="bg-[#ff6b00] text-black font-semibold
                     px-4 py-3 w-full rounded
                     hover:bg-[#ff842e] transition
                     disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Feedback"}
        </button>
      </form>
    </div>
  );
}
