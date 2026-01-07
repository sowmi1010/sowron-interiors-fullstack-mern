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
      toast.success("Portfolio deleted ✔");

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
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#ff6b00] tracking-wide">
          Completed Projects
        </h2>

        <button
          onClick={() => navigate("/admin/portfolio/add")}
          className="bg-[#ff6b00] text-black px-4 py-2 rounded-lg font-semibold"
        >
          + Add Project
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-400 text-center py-20">
          Loading portfolio…
        </p>
      ) : paginated.length === 0 ? (
        <p className="text-gray-400 text-center py-20">
          No Completed Projects Found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#141414] border border-[#222]
                         rounded-xl shadow-md overflow-hidden"
            >
              {/* IMAGE */}
              <div
                className="h-44 bg-[#111] bg-cover bg-center"
                style={
                  p.images?.length
                    ? { backgroundImage: `url(${p.images[0].url})` }
                    : {}
                }
              >
                {!p.images?.length && (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    <ImgIcon size={30} />
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-semibold">{p.title}</h3>

                {p.location && (
                  <span className="text-xs bg-[#222] px-2 py-1 rounded
                                   inline-flex items-center gap-1
                                   text-gray-300 mt-2">
                    <MapPin size={12} /> {p.location}
                  </span>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {p.images?.length || 0} Image(s)
                </p>

                {/* ACTIONS */}
                <div className="flex justify-between mt-4">
                  <button
                    className="text-yellow-400 flex items-center gap-1"
                    onClick={() =>
                      navigate(`/admin/portfolio/edit/${p._id}`)
                    }
                  >
                    <Edit3 size={15} /> Edit
                  </button>

                  <button
                    className="text-red-500 flex items-center gap-1"
                    onClick={() => setDeleteId(p._id)}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {filtered.length > PER_PAGE && (
        <Pagination
          page={page}
          total={filtered.length}
          onChange={setPage}
        />
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
            <div className="bg-[#1b1b1b] p-6 rounded-xl
                            text-center border border-[#2a2a2a]
                            w-80">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">
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
                  className="bg-red-600 hover:bg-red-700
                             px-4 py-2 rounded
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
