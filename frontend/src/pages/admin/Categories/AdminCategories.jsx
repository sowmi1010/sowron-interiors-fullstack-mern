import { useEffect, useMemo, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";
import { useSearch } from "../../../context/SearchContext";
import Pagination from "../../../components/ui/Pagination";

const LIMIT = 5;

export default function AdminCategories() {
  const { query } = useSearch();

  const [name, setName] = useState("");
  const [subs, setSubs] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      const res = await api.get("/categories");
      setList(res.data || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  /* ================= ADD ================= */
  const add = async () => {
    if (!name) return toast.error("Category name required");

    try {
      setLoading(true);

      const subCategories = subs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post("/categories", { name, subCategories });

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

  /* ================= DELETE ================= */
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

  /* ================= SEARCH FILTER ================= */
  const filtered = useMemo(() => {
    if (!query) return list;

    return list.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(query.toLowerCase());
      const subMatch = c.subCategories?.some((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      );
      return nameMatch || subMatch;
    });
  }, [list, query]);

  /* ================= PAGINATION ================= */
  const total = filtered.length;
  const start = (page - 1) * LIMIT;
  const paginated = filtered.slice(start, start + LIMIT);

  useEffect(() => {
    setPage(1); // reset page when search changes
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto text-white">

      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-brand-red">
          Manage Categories
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Search, add and organize categories
        </p>
      </div>

      {/* ADD FORM */}
      <div className="bg-black/60 backdrop-blur-xl border border-white/10
                      rounded-2xl p-6 mb-8 shadow-glass">
        <div className="grid gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="bg-white/5 border border-white/10
                       px-4 py-3 rounded-lg outline-none
                       focus:border-brand-yellow transition"
          />

          <input
            value={subs}
            onChange={(e) => setSubs(e.target.value)}
            placeholder="Sub categories (comma separated)"
            className="bg-white/5 border border-white/10
                       px-4 py-3 rounded-lg outline-none
                       focus:border-brand-yellow transition"
          />

          <button
            onClick={add}
            disabled={loading}
            className="flex items-center justify-center gap-2
                       bg-brand-red text-white font-semibold
                       py-3 rounded-lg hover:bg-brand-redDark
                       transition disabled:opacity-60"
          >
            <Plus size={18} />
            {loading ? "Saving..." : "Add Category"}
          </button>
        </div>
      </div>

      {/* LIST */}
      {paginated.length === 0 ? (
        <p className="text-gray-400 text-sm">No categories found</p>
      ) : (
        <div className="space-y-4">
          {paginated.map((c) => (
            <div
              key={c._id}
              className="group bg-black/50 backdrop-blur-xl
                         border border-white/10 rounded-xl p-5
                         hover:border-brand-red/40 transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-brand-yellow">
                  {c.name}
                </h3>

                <button
                  onClick={() => remove(c._id)}
                  className="flex items-center gap-1 text-sm
                             text-red-400 opacity-70
                             group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>

              {c.subCategories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {c.subCategories.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full
                                 bg-white/5 border border-white/10
                                 text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      <Pagination
        page={page}
        total={total}
        limit={LIMIT}
        onChange={setPage}
      />
    </div>
  );
}
