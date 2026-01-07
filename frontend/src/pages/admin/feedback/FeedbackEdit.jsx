import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
  const [loading, setLoading] = useState(false);

  /* LOAD */
  useEffect(() => {
    api.get(`/feedback/${id}`).then((res) => {
      const f = res.data;
      setForm({
        name: f.name,
        city: f.city,
        rating: String(f.rating),
        message: f.message || "",
      });
      setOldPhoto(f.photo?.url || null);
    });
  }, [id]);

  /* UPDATE */
  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append("photo", photo);

      await api.put(`/feedback/${id}`, fd);

      toast.success("Feedback updated ✔");
      navigate("/admin/feedback");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-[#ff6b00] mb-6">
        Edit Feedback
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-[#141414] border p-3 w-full rounded"
        />

        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="bg-[#141414] border p-3 w-full rounded"
        />

        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="bg-[#141414] border p-3 w-full rounded"
        >
          <option value="5">⭐ 5</option>
          <option value="4">⭐ 4</option>
          <option value="3">⭐ 3</option>
          <option value="2">⭐ 2</option>
          <option value="1">⭐ 1</option>
        </select>

        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="bg-[#141414] border p-3 w-full rounded min-h-[80px]"
        />

        {oldPhoto && (
          <img
            src={oldPhoto}
            className="h-20 rounded border"
            alt="old"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button
          disabled={loading}
          className="bg-[#ff6b00] text-black py-3 w-full rounded font-semibold"
        >
          {loading ? "Updating..." : "Update Feedback"}
        </button>
      </form>
    </div>
  );
}
