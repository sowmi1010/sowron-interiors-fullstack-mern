// src/pages/admin/portfolio/PortfolioAdmin.jsx
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import { Trash2, Edit3, MapPin, Image as ImgIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function PortfolioAdmin() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { query } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD PORTFOLIO ================= */
  const load = async () => {
    try {
      const res = await api.get("/portfolio");
      setList(res.data || []);
    } catch {
      toast.error("Failed to load portfolio");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= DELETE ================= */
  const remove = async () => {
    try {
      await api.delete(`/portfolio/${deleteId}`);
      toast.success("Portfolio deleted ✔");
      setDeleteId(null);
      load();
    } catch {
      toast.error("Delete failed");
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
  const PER_PAGE = 9;
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

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.length > 0 ? (
          paginated.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#141414] border border-[#222] rounded-xl shadow-md overflow-hidden"
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
                  <span className="text-xs bg-[#222] px-2 py-1 rounded inline-flex items-center gap-1 text-gray-300 mt-2">
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
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-400">
            No Completed Projects Found
          </p>
        )}
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        total={filtered.length}
        onChange={setPage}
      />

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-[#1b1b1b] p-6 rounded-xl text-center border border-[#2a2a2a] w-80">
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
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  onClick={remove}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
