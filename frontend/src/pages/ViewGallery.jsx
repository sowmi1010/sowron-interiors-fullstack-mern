import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Image as ImgIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

export default function ViewGallery() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  /* ================= LOAD ITEM ================= */
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
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [item]);

  if (loading) {
    return (
      <p className="text-center py-24 text-gray-400">
        Loading gallery…
      </p>
    );
  }

  if (!item || !item.images?.length) {
    return (
      <p className="text-center py-24 text-gray-400">
        Gallery not found
      </p>
    );
  }

  const images = item.images;
  const next = () => setActiveIndex((p) => (p + 1) % images.length);
  const prev = () => setActiveIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title={`${item.title} | Sowron Interiors Gallery`}
        description={`Explore ${item.title} interior project by Sowron Interiors. Premium turnkey interior execution and modular furniture.`}
        keywords="interior design project, modular kitchen, turnkey interiors, Sowron Interiors"
      />

      <section
        className="
          min-h-screen pb-28
          bg-gradient-to-b from-white via-white to-yellow-50/40
          dark:from-[#050505] dark:via-[#0b0b0b] dark:to-black
          text-gray-900 dark:text-gray-100
        "
      >
        {/* ================= BACK ================= */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <button
            onClick={() => navigate(-1)}
            className="
              inline-flex items-center gap-2 px-5 py-2 rounded-full
              bg-white dark:bg-[#1b1b1b]
              border border-red-200/40 dark:border-white/10
              shadow hover:shadow-red-600/20 transition
            "
          >
            <ArrowLeft size={18} /> Back to Gallery
          </button>
        </div>

        {/* ================= HEADER ================= */}
        <div className="text-center mt-12 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            {item.title}
            <span className="block mx-auto mt-4 w-24 h-[3px]
              bg-gradient-to-r from-red-600 to-yellow-400 rounded-full" />
          </motion.h1>

          <p className="mt-3 text-xs md:text-sm uppercase tracking-widest opacity-70">
            {item.category
              ? item.category.replace(/-/g, " ")
              : "Uncategorized"}
          </p>
        </div>

        {/* ================= MAIN SLIDER ================= */}
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 mt-14">
          <div
            className="
              relative h-[320px] md:h-[520px]
              rounded-[2rem] overflow-hidden
              shadow-2xl bg-black
              cursor-zoom-in group
            "
            onClick={() => setZoomImage(images[activeIndex].url)}
          >
            {/* PREV */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="
                absolute left-5 top-1/2 -translate-y-1/2 z-10
                bg-black/40 hover:bg-black/70
                p-3 rounded-full transition
              "
            >
              <ChevronLeft />
            </button>

            {/* NEXT */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="
                absolute right-5 top-1/2 -translate-y-1/2 z-10
                bg-black/40 hover:bg-black/70
                p-3 rounded-full transition
              "
            >
              <ChevronRight />
            </button>

            <AnimatePresence mode="wait">
              {images[activeIndex]?.url ? (
                <motion.img
                  key={activeIndex}
                  src={images[activeIndex].url}
                  alt={item.title}
                  loading="lazy"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="object-cover h-full w-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImgIcon className="text-gray-400" size={40} />
                </div>
              )}
            </AnimatePresence>

            {/* ZOOM BADGE */}
            <div className="
              absolute bottom-5 right-5
              bg-white/80 dark:bg-black/60
              px-3 py-1 rounded-full text-xs
              flex items-center gap-2
            ">
              <ZoomIn size={14} /> Click to zoom
            </div>
          </div>
        </div>

        {/* ================= THUMBNAILS ================= */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 flex gap-4">
          {images.map((img, idx) => (
            <motion.img
              key={img.public_id || idx}
              src={img.url}
              alt={`Interior project image ${idx + 1}`}
              loading="lazy"
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveIndex(idx)}
              className={`
                h-20 w-32 rounded-xl cursor-pointer
                transition-all
                ${
                  idx === activeIndex
                    ? "ring-4 ring-yellow-400"
                    : "opacity-60 hover:opacity-100"
                }
              `}
            />
          ))}
        </div>
      </section>

      {/* ================= LIGHTBOX ================= */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-[999]
                       flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
          >
            <motion.img
              src={zoomImage}
              alt="Zoomed interior project"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
