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

export default function GalleryList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewImages, setViewImages] = useState([]);

  const { query } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD GALLERY ================= */
  useEffect(() => {
    let mounted = true;

    const loadGallery = async () => {
      try {
const res = await api.get("/gallery/admin");
        if (mounted) {
          setItems(res.data?.items || []);
        }
      } catch {
        toast.error("Failed to load gallery");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    

    loadGallery();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= DELETE ================= */
  const deleteItem = async () => {
    if (!deleteId || deleting) return;

    try {
      setDeleting(true);
      await api.delete(`/gallery/${deleteId}`);

      toast.success("Gallery item deleted ✔");
      setItems((prev) => prev.filter((i) => i._id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  /* ================= SEARCH (SAFE) ================= */
  const filtered = items.filter((i) => {
    const q = query.toLowerCase();
    return (
      i.title?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <p className="text-gray-400 p-6 text-center">
        Loading gallery...
      </p>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ff6b00]">
          Gallery
        </h2>
        <button
          className="bg-[#ff6b00] text-black px-4 py-2 rounded font-semibold"
          onClick={() => navigate("/admin/gallery/add")}
        >
          + Add
        </button>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No gallery items found
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#141414] rounded-xl border border-[#222] overflow-hidden"
            >
              {/* IMAGE */}
              <div className="h-40 overflow-hidden flex justify-center items-center bg-black">
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
              <div className="p-3">
                <h4 className="font-semibold truncate">
                  {item.title}
                </h4>

                {item.category && (
                  <span className="text-xs bg-[#222] px-2 py-1 rounded mt-1 inline-flex items-center gap-1">
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
            <div className="bg-[#1b1b1b] p-6 rounded-lg
                            grid grid-cols-2 md:grid-cols-3 gap-3
                            max-h-[80vh] overflow-y-auto">
              {viewImages.map((img, idx) => (
                <img
                  key={img.public_id || idx}
                  src={img.url}
                  className="rounded"
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
            <div className="bg-[#1b1b1b] p-6 rounded-lg w-72 text-center">
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
