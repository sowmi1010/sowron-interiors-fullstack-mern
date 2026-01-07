import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Image as ImgIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ViewGallery() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  /* ================= LOAD SINGLE ITEM ================= */
  const loadItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/gallery/${id}`);
      setItem(res.data);
    } catch {
      toast.error("Gallery item not found");
      navigate("/gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
    window.scrollTo(0, 0);
  }, [id]);

  /* ================= AUTO SLIDER ================= */
  useEffect(() => {
    if (!item?.images?.length) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % item.images.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [item]);

  if (loading) {
    return (
      <p className="text-center py-20 text-gray-400">
        Loading gallery…
      </p>
    );
  }

  if (!item || !item.images?.length) {
    return (
      <p className="text-center py-20 text-gray-400">
        Gallery not found
      </p>
    );
  }

  const images = item.images;

  const next = () =>
    setActiveIndex((p) => (p + 1) % images.length);

  const prev = () =>
    setActiveIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">

      {/* BACK */}
      <div className="px-6 md:px-20 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white dark:bg-[#1b1b1b]
                     px-4 py-2 rounded-lg shadow"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* TITLE */}
      <h1 className="text-center text-5xl font-extrabold mt-6
                     bg-gradient-to-r from-orange-500 to-yellow-400
                     bg-clip-text text-transparent">
        {item.title}
      </h1>

      <p className="text-center uppercase tracking-wide opacity-70">
        {item.category
          ? item.category.replace(/-/g, " ")
          : "Uncategorized"}
      </p>

      {/* SLIDER */}
      <div className="px-4 md:px-28 mt-10 relative">
        <div
          className="relative group h-[350px] md:h-[520px]
                     overflow-hidden rounded-3xl shadow-2xl
                     bg-black cursor-pointer"
          onClick={() => setZoomImage(images[activeIndex].url)}
        >
          {/* PREV */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2
                       bg-black/40 p-3 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>

          {/* NEXT */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2
                       bg-black/40 p-3 rounded-full"
          >
            <ChevronRight size={20} />
          </button>

          <AnimatePresence mode="wait">
            {images[activeIndex]?.url ? (
              <motion.img
                key={activeIndex}
                src={images[activeIndex].url}
                alt={item.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImgIcon className="text-gray-400" size={40} />
              </div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 right-4
                          bg-white/40 p-2 rounded-lg
                          text-xs flex gap-1">
            <ZoomIn size={16} /> Zoom
          </div>
        </div>
      </div>

      {/* THUMBNAILS */}
      <div className="px-4 md:px-28 mt-6 flex gap-4 overflow-x-auto">
        {images.map((img, idx) => (
          <motion.img
            key={img.public_id || idx}
            src={img.url}
            alt={`Gallery ${idx + 1}`}
            onClick={() => setActiveIndex(idx)}
            className={`h-20 w-32 rounded-xl cursor-pointer
              ${
                idx === activeIndex
                  ? "ring-4 ring-orange-400"
                  : "opacity-70"
              }`}
          />
        ))}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex
                       items-center justify-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
          >
            <motion.img
              src={zoomImage}
              alt="Zoomed"
              className="max-h-[90vh] max-w-[90vw] rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
