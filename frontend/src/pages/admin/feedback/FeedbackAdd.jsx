import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";
import { X, Star } from "lucide-react";

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
      fd.append("rating", Number(form.rating));
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
    <div className="p-6 text-white max-w-[1100px] mx-auto">
      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red">
          Add Customer Feedback
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Showcase real customer experiences
        </p>
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={submit}
        className="bg-black/60 backdrop-blur-xl
                   border border-white/10
                   rounded-2xl p-8
                   max-w-xl mx-auto
                   shadow-glass space-y-5"
      >
        {/* NAME */}
        <input
          placeholder="Customer Name"
          className="bg-white/5 border border-white/10
                     px-4 py-3 rounded-lg w-full
                     outline-none focus:border-brand-yellow transition"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* CITY */}
        <select
          className="bg-white/5 border border-white/10
                     px-4 py-3 rounded-lg w-full
                     text-gray-300 outline-none
                     focus:border-brand-yellow transition"
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

        {/* RATING */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">
            Rating
          </label>
          <select
            className="bg-white/5 border border-white/10
                       px-4 py-3 rounded-lg w-full
                       outline-none focus:border-brand-yellow transition"
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: e.target.value })
            }
          >
            <option value="">Select Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ – Excellent</option>
            <option value="4">⭐⭐⭐⭐ – Good</option>
            <option value="3">⭐⭐⭐ – Average</option>
            <option value="2">⭐⭐ – Poor</option>
            <option value="1">⭐ – Very Poor</option>
          </select>
        </div>

        {/* MESSAGE */}
        <textarea
          placeholder="Customer message (optional)"
          className="bg-white/5 border border-white/10
                     px-4 py-3 rounded-lg w-full min-h-[100px]
                     outline-none resize-none
                     focus:border-brand-yellow transition"
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
        />

        {/* PHOTO UPLOAD */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            Customer Photo (optional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="block w-full text-sm text-gray-400
                       file:bg-brand-red file:text-white
                       file:border-0 file:px-4 file:py-2
                       file:rounded-lg cursor-pointer"
          />

          {preview && (
            <div className="relative mt-4 w-28 h-28">
              <img
                src={preview}
                alt="Preview"
                className="rounded-xl object-cover w-full h-full
                           border border-white/10"
              />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(preview);
                  setPreview(null);
                  setPhoto(null);
                }}
                className="absolute -top-2 -right-2
                           bg-black/80 p-1 rounded-full
                           hover:bg-brand-red transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="w-full flex items-center justify-center gap-2
                     bg-brand-red text-white
                     font-semibold py-3 rounded-lg
                     hover:bg-brand-redDark transition
                     disabled:opacity-60"
        >
          <Star size={16} />
          {loading ? "Saving Feedback..." : "Save Feedback"}
        </button>
      </form>
    </div>
  );
}
