// src/pages/admin/portfolio/PortfolioAdmin.jsx
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import { Trash2, Edit3, MapPin, Image as ImgIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PER_PAGE = 9;

export default function PortfolioAdmin() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { query } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/portfolio");
      setList(res.data || []);
    } catch {
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* RESET PAGE ON SEARCH */
  useEffect(() => {
    setPage(1);
  }, [query]);

  /* ================= DELETE ================= */
  const remove = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      await api.delete(`/portfolio/${deleteId}`);
      toast.success("Portfolio deleted");

      setList((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH ================= */
  const filtered = list.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
  });

  /* ================= PAGINATION ================= */
  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  return (
    <div className="p-6 text-white max-w-[1400px] mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-brand-red">
            Completed Projects
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {query
              ? `Showing results for “${query}”`
              : "Manage your completed interior projects"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/portfolio/add")}
          className="bg-brand-red text-white px-5 py-2.5
                     rounded-lg font-semibold
                     hover:bg-brand-redDark transition"
        >
          + Add Project
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-400 text-center py-24">
          Loading portfolio…
        </p>
      ) : paginated.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400">
            {query ? "No matching projects found" : "No projects added yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              className="group bg-black/60 backdrop-blur-xl
                         border border-white/10 rounded-2xl
                         overflow-hidden shadow-glass
                         hover:border-brand-red/40 transition"
            >
              {/* IMAGE */}
              <div className="relative h-44 bg-black">
                {p.images?.length ? (
                  <img
                    src={p.images[0].url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <ImgIcon size={30} />
                  </div>
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t
                                from-black/70 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">
                  {p.title}
                </h3>

                {p.location && (
                  <div className="flex items-center gap-1
                                  text-xs text-gray-400 mt-1">
                    <MapPin size={12} />
                    {p.location}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {p.images?.length || 0} Images
                </p>

                {/* ACTIONS */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() =>
                      navigate(`/admin/portfolio/edit/${p._id}`)
                    }
                    className="text-brand-yellow text-sm
                               flex items-center gap-1
                               hover:underline"
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(p._id)}
                    className="text-red-400 text-sm
                               flex items-center gap-1
                               hover:underline"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {filtered.length > PER_PAGE && (
        <div className="mt-10 flex justify-center">
          <Pagination
            page={page}
            total={filtered.length}
            limit={PER_PAGE}
            onChange={setPage}
          />
        </div>
      )}

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60
                       flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/80 backdrop-blur-xl
                            border border-white/10
                            p-6 rounded-xl w-80 text-center">
              <h3 className="text-lg font-semibold mb-4">
                Delete this project?
              </h3>

              <div className="flex gap-3 justify-center">
                <button
                  className="bg-gray-600 px-4 py-2 rounded"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>

                <button
                  disabled={deleting}
                  className="bg-red-600 px-4 py-2 rounded
                             disabled:opacity-50"
                  onClick={remove}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
