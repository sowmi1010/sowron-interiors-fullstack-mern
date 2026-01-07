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

export default function FeedbackList() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { query = "" } = useSearch();
  const navigate = useNavigate();

  /* 🔄 LOAD */
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

  /* 🔍 RESET PAGE ON SEARCH */
  useEffect(() => {
    setPage(1);
  }, [query]);

  /* ❌ DELETE */
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

  /* 🔍 SAFE SEARCH */
  const filtered = list.filter(
    (f) =>
      f.name?.toLowerCase().includes(query.toLowerCase()) ||
      f.city?.toLowerCase().includes(query.toLowerCase())
  );

  const perPage = 8;
  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="p-6 text-white relative">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#ff6b00]">
          Customer Feedback
        </h2>

        <button
          onClick={() => navigate("/admin/feedback/add")}
          className="bg-[#ff6b00] hover:bg-[#ff842e]
                     text-black px-4 py-2 rounded-lg font-semibold"
        >
          + Add Feedback
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#121212] rounded-xl border border-[#1f1f1f] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#181818] text-[#ccc] uppercase">
              <th className="px-5 py-3 text-left">Photo</th>
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">City</th>
              <th className="px-5 py-3 text-left">Rating</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-10 text-center text-gray-500"
                >
                  Loading feedback…
                </td>
              </tr>
            ) : paginated.length ? (
              paginated.map((f) => (
                <tr
                  key={f._id}
                  className="border-t border-[#232323]
                             hover:bg-[#1c1c1c] cursor-pointer"
                  onClick={() => setSelected(f)}
                >
                  {/* PHOTO */}
                  <td className="px-5 py-3">
                    {f.photo?.url ? (
                      <img
                        src={f.photo.url}
                        alt={f.name}
                        className="w-10 h-10 rounded-full object-cover
                                   border border-[#333]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#222]
                                      flex items-center justify-center
                                      text-gray-500">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3">{f.name}</td>
                  <td className="px-5 py-3">{f.city}</td>

                  {/* RATING */}
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {[...Array(Number(f.rating))].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-yellow-400"
                          fill="yellow"
                        />
                      ))}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="px-5 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          navigate(`/admin/feedback/edit/${f._id}`)
                        }
                        className="text-yellow-400 flex items-center gap-1"
                      >
                        <Edit3 size={15} /> Edit
                      </button>

                      <button
                        onClick={() => setDeleteId(f._id)}
                        className="text-red-500 flex items-center gap-1"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-10 text-center text-gray-500"
                >
                  No feedback found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={filtered.length}
        onChange={setPage}
      />

      {/* DRAWER */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            className="fixed top-0 right-0 w-80 h-full
                       bg-[#0f0f0f] border-l border-[#222]
                       shadow-lg p-6 z-50"
          >
            <div className="flex justify-between">
              <h3 className="text-lg text-[#ff6b00] font-semibold">
                Details
              </h3>
              <X
                onClick={() => setSelected(null)}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-4 mt-4 text-gray-200">
              {selected.photo?.url && (
                <img
                  src={selected.photo.url}
                  alt={selected.name}
                  className="w-full h-40 rounded-lg object-cover"
                />
              )}
              <p className="flex gap-2 items-center">
                <User2 size={16} /> {selected.name}
              </p>
              <p className="flex gap-2 items-center">
                <MapPin size={16} /> {selected.city}
              </p>
              {selected.message && (
                <p className="flex gap-2 items-center">
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
          <motion.div className="fixed inset-0 bg-black/60
                                  flex justify-center items-center z-50">
            <motion.div className="bg-[#1b1b1b] p-6 rounded-xl
                                   text-center w-80
                                   border border-[#2a2a2a]">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
