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
  X,
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
    }, 4500);

    return () => clearInterval(intervalRef.current);
  }, [item]);

  if (loading) {
    return <p className="text-center py-32 text-brand-lightSubText">Loading project…</p>;
  }

  if (!item || !item.images?.length) {
    return <p className="text-center py-32 text-brand-lightSubText">Gallery not found</p>;
  }

  const images = item.images;
  const next = () => setActiveIndex((p) => (p + 1) % images.length);
  const prev = () => setActiveIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <>
      <SEO
        title={`${item.title} | Sowron Interiors Gallery`}
        description={`Explore ${item.title} interior project by Sowron Interiors.`}
      />

      <section className="min-h-screen pb-32 bg-brand-lightBg dark:bg-brand-darkBg text-brand-lightText dark:text-brand-darkText transition-colors">

        {/* BACK */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2 rounded-full
              bg-brand-lightCard dark:bg-brand-darkCard backdrop-blur
              border border-brand-yellow/40 dark:border-white/10
              shadow-card hover:shadow-glow transition"
          >
            <ArrowLeft size={18} /> Back to Gallery
          </button>
        </div>

        {/* HEADER */}
        <div className="text-center mt-16 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-wide"
          >
            {item.title}
            <span className="block mx-auto mt-5 w-28 h-[3px]
              bg-gradient-to-r from-brand-red to-brand-yellow rounded-full" />
          </motion.h1>

          <p className="mt-4 text-xs md:text-sm uppercase tracking-widest text-brand-lightSubText dark:text-brand-darkSubText">
            {item.category?.replace(/-/g, " ") || "Premium Interior Project"}
          </p>
        </div>

        {/* MAIN SLIDER */}
        <div className="relative max-w-7xl mx-auto px-6 mt-20">
          <div
            className="relative h-[300px] sm:h-[420px] md:h-[560px]
              rounded-[2.5rem] overflow-hidden
              shadow-2xl bg-black cursor-zoom-in"
            onClick={() => setZoomImage(images[activeIndex].url)}
          >
            {/* CONTROLS */}
            <button onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full">
              <ChevronLeft className="text-white" />
            </button>

            <button onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full">
              <ChevronRight className="text-white" />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={images[activeIndex].url}
                alt={item.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="object-cover h-full w-full"
              />
            </AnimatePresence>

            <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-black/70 backdrop-blur
              px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xl">
              <ZoomIn size={14} /> View Fullscreen
            </div>
          </div>
        </div>

        {/* THUMBNAILS */}
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {images.map((img, idx) => (
              <motion.img
                key={idx}
                src={img.url}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveIndex(idx)}
                className={`h-24 w-36 rounded-2xl cursor-pointer transition-all
                  ${idx === activeIndex
                    ? "ring-4 ring-brand-yellow shadow-xl"
                    : "opacity-60 hover:opacity-100"
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
          >
            <button className="absolute top-6 right-6 bg-black/60 p-3 rounded-full text-white">
              <X />
            </button>

            <motion.img
              src={zoomImage}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-[90vw] rounded-3xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
