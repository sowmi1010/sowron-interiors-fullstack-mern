import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [name, setName] = useState("");
  const [subs, setSubs] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/categories");
      setList(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  // ➕ Add category
  const add = async () => {
    if (!name) return toast.error("Category name required");

    try {
      setLoading(true);

      const subCategories = subs
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      await api.post("/categories", {
        name,
        subCategories,
      });

      toast.success("Category added");
      setName("");
      setSubs("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete category
  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-orange-500">
        Manage Categories
      </h2>

      {/* ADD FORM */}
      <div className="bg-[#141414] border border-[#222] p-4 rounded mb-6">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Category name"
          className="bg-[#1a1a1a] p-2 rounded w-full mb-2"
        />

        <input
          value={subs}
          onChange={e => setSubs(e.target.value)}
          placeholder="Sub categories (comma separated)"
          className="bg-[#1a1a1a] p-2 rounded w-full mb-3"
        />

        <button
          onClick={add}
          disabled={loading}
          className="bg-orange-500 px-4 py-2 rounded text-black font-semibold"
        >
          {loading ? "Saving..." : "Add Category"}
        </button>
      </div>

      {/* LIST */}
      {list.length === 0 ? (
        <p className="text-gray-400">No categories found</p>
      ) : (
        list.map(c => (
          <div
            key={c._id}
            className="bg-[#111] border border-[#222] p-4 rounded mb-3"
          >
            <div className="flex justify-between items-center">
              <strong className="text-orange-400">{c.name}</strong>
              <button
                onClick={() => remove(c._id)}
                className="text-red-400 text-sm"
              >
                Delete
              </button>
            </div>

            {/* SUB CATEGORIES */}
            {c.subCategories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {c.subCategories.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#222] px-2 py-1 rounded text-gray-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
