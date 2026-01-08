import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import Pagination from "../../../components/ui/Pagination.jsx";
import { useSearch } from "../../../context/SearchContext";
import {
  Star,
  Trash2,
  Edit3,
  User2,
  MapPin,
  X,
  MessageCircle,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PER_PAGE = 8;

export default function FeedbackList() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { query = "" } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/feedback");
      setList(res.data || []);
    } catch {
      toast.error("Unable to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* RESET PAGE ON SEARCH */
  useEffect(() => setPage(1), [query]);

  /* ================= DELETE ================= */
  const remove = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await api.delete(`/feedback/${deleteId}`);
      toast.success("Feedback deleted");

      setList((prev) => prev.filter((f) => f._id !== deleteId));
      setDeleteId(null);
      setSelected(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH ================= */
  const filtered = list.filter(
    (f) =>
      f.name?.toLowerCase().includes(query.toLowerCase()) ||
      f.city?.toLowerCase().includes(query.toLowerCase())
  );

  const paginated = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-brand-red">
            Customer Feedback
          </h2>
          <p className="text-sm text-gray-400">
            Manage testimonials & customer reviews
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/feedback/add")}
          className="bg-brand-red text-white px-5 py-2.5 rounded-lg
                     font-semibold hover:bg-brand-redDark transition"
        >
          + Add Feedback
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl overflow-hidden shadow-glass">

        <table className="w-full text-sm">
          <thead className="bg-white/5 uppercase text-xs text-gray-300">
            <tr>
              <th className="px-5 py-4 text-left">Customer</th>
              <th className="px-5 py-4 text-left">City</th>
              <th className="px-5 py-4 text-left">Rating</th>
              <th className="px-5 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-16 text-center text-gray-400">
                  Loading feedback…
                </td>
              </tr>
            ) : paginated.length ? (
              paginated.map((f) => (
                <tr
                  key={f._id}
                  onClick={() => setSelected(f)}
                  className="border-t border-white/5
                             hover:bg-white/5 transition cursor-pointer"
                >
                  {/* CUSTOMER */}
                  <td className="px-5 py-4 flex items-center gap-3">
                    {f.photo?.url ? (
                      <img
                        src={f.photo.url}
                        className="w-10 h-10 rounded-full object-cover
                                   border border-white/10"
                        alt={f.name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10
                                      flex items-center justify-center">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <span className="font-medium">{f.name}</span>
                  </td>

                  {/* CITY */}
                  <td className="px-5 py-4 text-gray-300">
                    {f.city}
                  </td>

                  {/* RATING */}
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      {[...Array(Number(f.rating))].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-brand-yellow"
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="px-5 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() =>
                          navigate(`/admin/feedback/edit/${f._id}`)
                        }
                        className="text-brand-yellow hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteId(f._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-16 text-center text-gray-500">
                  No feedback found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        total={filtered.length}
        limit={PER_PAGE}
        onChange={setPage}
      />

      {/* DETAILS DRAWER */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            className="fixed top-0 right-0 w-[360px] h-full
                       bg-black/80 backdrop-blur-xl
                       border-l border-white/10
                       p-6 z-50"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-red">
                Feedback Details
              </h3>
              <X
                onClick={() => setSelected(null)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-4 text-gray-200">
              {selected.photo?.url && (
                <img
                  src={selected.photo.url}
                  className="w-full h-40 rounded-xl object-cover"
                  alt=""
                />
              )}

              <p className="flex gap-2 items-center">
                <User2 size={16} /> {selected.name}
              </p>

              <p className="flex gap-2 items-center">
                <MapPin size={16} /> {selected.city}
              </p>

              {selected.message && (
                <p className="flex gap-2">
                  <MessageCircle size={16} />
                  {selected.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60
                       flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-[#111] border border-white/10
                            rounded-xl p-6 w-80 text-center">
              <h3 className="text-lg mb-4">
                Delete this feedback?
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
                             disabled:opacity-60"
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
