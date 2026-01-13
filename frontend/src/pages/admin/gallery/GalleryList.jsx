import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import {
  Trash2,
  Edit3,
  Image as ImgIcon,
  Folder,
  Eye,
  X,
} from "lucide-react";
import { useSearch } from "../../../context/SearchContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/ui/Pagination";

export default function GalleryList() {
  const navigate = useNavigate();
  const { debouncedQuery } = useSearch(); // ✅ global debounced search

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 9;

  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewImages, setViewImages] = useState([]);

  /* ================= LOAD GALLERY ================= */
  const loadGallery = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/gallery/admin?page=${page}&limit=${limit}&q=${debouncedQuery}`
      );

      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  /* 🔄 LOAD ON PAGE / SEARCH */
  useEffect(() => {
    loadGallery();
  }, [page, debouncedQuery]);

  /* 🔄 RESET PAGE WHEN SEARCH CHANGES */
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  /* ================= DELETE ================= */
  const deleteItem = async () => {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);
      await api.delete(`/gallery/${deleteId}`);

      toast.success("Gallery item deleted");
      setDeleteId(null);
      loadGallery();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <p className="text-gray-400 p-6 text-center">
        Loading gallery…
      </p>
    );
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-red">
            Gallery
          </h2>
          <p className="text-sm text-gray-400">
            Manage gallery images
          </p>
        </div>

        <button
          className="bg-brand-red text-white px-4 py-2 rounded-lg font-semibold
                     hover:bg-brand-redDark transition"
          onClick={() => navigate("/admin/gallery/add")}
        >
          + Add Gallery
        </button>
      </div>

      {/* GRID */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-center mt-16">
          No gallery items found
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 backdrop-blur-xl
                         rounded-xl border border-white/10
                         overflow-hidden hover:border-brand-red/40
                         transition"
            >
              {/* IMAGE */}
              <div className="h-40 bg-black flex items-center justify-center">
                {item.images?.length ? (
                  <img
                    src={item.images[0].url}
                    className="object-cover w-full h-full"
                    alt={item.title}
                  />
                ) : (
                  <ImgIcon className="text-gray-500 w-8 h-8" />
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h4 className="font-semibold truncate">
                  {item.title}
                </h4>

                {item.category && (
                  <span className="mt-1 inline-flex items-center gap-1
                                   text-xs bg-white/5 border border-white/10
                                   px-2 py-1 rounded">
                    <Folder size={12} />
                    {item.category.replace(/-/g, " ")}
                  </span>
                )}

                {/* ACTIONS */}
                <div className="mt-4 flex justify-between text-sm">
                  <button
                    className="text-blue-400 flex items-center gap-1"
                    onClick={() => setViewImages(item.images || [])}
                  >
                    <Eye size={14} /> View
                  </button>

                  <button
                    className="text-yellow-400 flex items-center gap-1"
                    onClick={() =>
                      navigate(`/admin/gallery/edit/${item._id}`)
                    }
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    className="text-red-500 flex items-center gap-1"
                    onClick={() => setDeleteId(item._id)}
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
      <Pagination
        page={page}
        total={total}
        limit={limit}
        onChange={setPage}
      />

      {/* IMAGE VIEWER */}
      <AnimatePresence>
        {viewImages.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 p-6
                       flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-[#1b1b1b] p-6 rounded-xl
                            grid grid-cols-2 md:grid-cols-3 gap-3
                            max-h-[80vh] overflow-y-auto">
              {viewImages.map((img, idx) => (
                <img
                  key={img.public_id || idx}
                  src={img.url}
                  className="rounded-xl object-cover"
                  alt=""
                />
              ))}
            </div>

            <button
              className="absolute top-4 right-4"
              onClick={() => setViewImages([])}
            >
              <X className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-black/60
                       flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-[#1b1b1b] p-6 rounded-xl w-72 text-center">
              <p className="mb-4 text-white">
                Delete this gallery item?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  className="bg-gray-600 px-4 py-2 rounded"
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  className="bg-red-600 px-4 py-2 rounded
                             disabled:opacity-60"
                  onClick={deleteItem}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
