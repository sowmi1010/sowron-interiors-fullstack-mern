import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X } from "lucide-react";

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

  /* 🔄 LOAD FEEDBACK */
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

  /* 📸 NEW PHOTO */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  /* 💾 UPDATE */
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
      <p className="text-center text-gray-400 mt-10">
        Loading…
      </p>
    );
  }

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-[#ff6b00] mb-6">
        Edit Feedback
      </h2>

      <form onSubmit={submit} className="space-y-4">

        <input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          placeholder="Name"
          className="bg-[#141414] border p-3 w-full rounded"
        />

        <input
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
          placeholder="City"
          className="bg-[#141414] border p-3 w-full rounded"
        />

        <select
          value={form.rating}
          onChange={(e) =>
            setForm({ ...form, rating: e.target.value })
          }
          className="bg-[#141414] border p-3 w-full rounded"
        >
          <option value="">Rating</option>
          <option value="5">⭐ 5 – Excellent</option>
          <option value="4">⭐ 4 – Good</option>
          <option value="3">⭐ 3 – Average</option>
          <option value="2">⭐ 2 – Poor</option>
          <option value="1">⭐ 1 – Very Poor</option>
        </select>

        <textarea
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
          placeholder="Message"
          className="bg-[#141414] border p-3 w-full rounded min-h-[90px]"
        />

        {/* OLD PHOTO */}
        {oldPhoto && !preview && (
          <div>
            <p className="text-sm text-gray-400 mb-1">
              Current Photo
            </p>
            <img
              src={oldPhoto}
              className="h-20 rounded border"
              alt="Current"
            />
          </div>
        )}

        {/* NEW PREVIEW */}
        {preview && (
          <div className="relative w-24 h-24">
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

        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="bg-[#141414] border p-2 w-full rounded"
        />

        <button
          disabled={saving}
          className="bg-[#ff6b00] text-black py-3
                     w-full rounded font-semibold
                     disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update Feedback"}
        </button>
      </form>
    </div>
  );
}
