import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X, Star } from "lucide-react";

export default function FeedbackEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    city: "",
    rating: "",
    message: "",
  });

  const [photo, setPhoto] = useState(null);
  const [oldPhoto, setOldPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    api
      .get(`/feedback/${id}`)
      .then((res) => {
        const f = res.data;
        setForm({
          name: f.name,
          city: f.city,
          rating: String(f.rating),
          message: f.message || "",
        });
        setOldPhoto(f.photo?.url || null);
      })
      .catch(() => {
        toast.error("Feedback not found");
        navigate("/admin/feedback");
      })
      .finally(() => setLoading(false));

    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [id]);

  /* ================= PHOTO PICK ================= */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPDATE ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.city || !form.rating) {
      return toast.error("Name, City & Rating are required");
    }

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("city", form.city);
      fd.append("rating", Number(form.rating));
      fd.append("message", form.message.trim());

      if (photo) fd.append("photo", photo);

      await api.put(`/feedback/${id}`, fd);

      toast.success("Feedback updated successfully");
      navigate("/admin/feedback");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-16">
        Loading feedback…
      </p>
    );
  }

  return (
    <div className="p-6 text-white max-w-[1100px] mx-auto">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red">
          Edit Feedback
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Update customer testimonial details
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
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          placeholder="Customer Name"
          className="bg-white/5 border border-white/10
                     px-4 py-3 rounded-lg w-full
                     outline-none focus:border-brand-yellow transition"
        />

        {/* CITY */}
        <input
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
          placeholder="City"
          className="bg-white/5 border border-white/10
                     px-4 py-3 rounded-lg w-full
                     outline-none focus:border-brand-yellow transition"
        />

        {/* RATING */}
        <div>
          <label className="text-sm text-gray-400 mb-1 block">
            Rating
          </label>
          <select
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: e.target.value })
            }
            className="bg-white/5 border border-white/10
                       px-4 py-3 rounded-lg w-full
                       outline-none focus:border-brand-yellow transition"
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
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
          placeholder="Customer message"
          className="bg-white/5 border border-white/10
                     px-4 py-3 rounded-lg w-full min-h-[100px]
                     outline-none resize-none
                     focus:border-brand-yellow transition"
        />

        {/* CURRENT PHOTO */}
        {oldPhoto && !preview && (
          <div>
            <p className="text-sm text-gray-400 mb-2">
              Current Photo
            </p>
            <img
              src={oldPhoto}
              alt="Current"
              className="h-24 w-24 object-cover rounded-xl
                         border border-white/10"
            />
          </div>
        )}

        {/* NEW PREVIEW */}
        {preview && (
          <div className="relative w-24 h-24">
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

        {/* PHOTO INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="block w-full text-sm text-gray-400
                     file:bg-brand-red file:text-white
                     file:border-0 file:px-4 file:py-2
                     file:rounded-lg cursor-pointer"
        />

        {/* SUBMIT */}
        <button
          disabled={saving}
          className="w-full flex items-center justify-center gap-2
                     bg-brand-red text-white
                     font-semibold py-3 rounded-lg
                     hover:bg-brand-redDark transition
                     disabled:opacity-60"
        >
          <Star size={16} />
          {saving ? "Updating Feedback..." : "Update Feedback"}
        </button>
      </form>
    </div>
  );
}
