import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import SecureImageCanvas from "../components/ui/SecureImageCanvas.jsx";

export default function ViewGallery() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const watermark = "enquiry@sowron.com";

  const intervalRef = useRef(null);

  /* ================= LOAD ITEM ================= */
  useEffect(() => {
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

    loadItem();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const onBlur = () => setIsBlurred(true);
    const onFocus = () => setIsBlurred(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    const onKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["U", "S", "P"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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
      <p className="text-center py-32 text-gray-400">
        Loading project…
      </p>
    );
  }

  if (!item || !item.images?.length) {
    return (
      <p className="text-center py-32 text-gray-400">
        Gallery not found
      </p>
    );
  }

  const images = item.images;
  const getSlideSrc = (img) => img?.mediumUrl || img?.url || img?.fullUrl || "";
  const getThumbSrc = (img) => img?.thumbUrl || img?.mediumUrl || img?.url || "";
  const getFullSrc = (img) => img?.fullUrl || img?.mediumUrl || img?.url || "";

  const next = () =>
    setActiveIndex((p) => (p + 1) % images.length);
  const prev = () =>
    setActiveIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <>
      <SEO
        title={`${item.title} | Sowron Interiors`}
        description={`Explore ${item.title} interior project by Sowron Interiors.`}
      />

      <section
        className="min-h-screen bg-white dark:bg-black text-black dark:text-white pb-32"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,245,245,0.92),rgba(255,255,255,0.96))]
          dark:bg-[radial-gradient(circle_at_top,rgba(20,20,20,0.9),rgba(10,10,10,0.95),rgba(0,0,0,0.98))]" />
        {isBlurred && (
          <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md
            flex items-center justify-center text-white text-sm">
            Screen hidden for security
          </div>
        )}

        {/* BACK */}
        <div className="max-w-7xl mx-auto px-6 pt-24">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2
              px-6 py-2 rounded-full
              bg-white/80 dark:bg-black/60 backdrop-blur
              border border-black/10 dark:border-white/10
              shadow hover:shadow-xl transition"
          >
            <ArrowLeft size={18} /> Back to Gallery
          </button>
        </div>

        {/* TITLE */}
        <div className="text-center mt-16 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            {item.title}
          </motion.h1>

          <div className="flex justify-center mt-6">
            <span
              className="px-6 py-2 rounded-full text-xs uppercase tracking-widest
              bg-gradient-to-r from-red-600 to-red-900
              text-white font-semibold shadow-lg"
            >
              {item.category?.name}
              {item.subCategory && ` • ${item.subCategory}`}
            </span>
          </div>
        </div>

        {/* HERO SLIDER */}
        <div className="relative max-w-7xl mx-auto px-6 mt-20">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative h-[320px] sm:h-[460px] md:h-[600px]
              rounded-[3rem] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.35)]
              bg-black cursor-zoom-in"
            onClick={() => setZoomImage(images[activeIndex])}
          >
            {/* CONTROLS */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2
                bg-black/60 p-3 rounded-full text-white backdrop-blur"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2
                bg-black/60 p-3 rounded-full text-white backdrop-blur"
            >
              <ChevronRight />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full"
              >
                <SecureImageCanvas
                  src={getSlideSrc(images[activeIndex])}
                  alt={item.title}
                  watermark={watermark}
                  maxDimension={2200}
                  className="w-full h-full"
                  rounded={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* ZOOM LABEL */}
            <div
              className="absolute bottom-6 right-6
              bg-white/90 dark:bg-black/70 backdrop-blur
              px-4 py-2 rounded-full text-xs font-semibold
              flex items-center gap-2 shadow-xl"
            >
              <ZoomIn size={14} /> View Fullscreen
            </div>
          </motion.div>
        </div>

        {/* THUMB STRIP */}
        <div className="max-w-7xl mx-auto px-6 mt-14">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {images.map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1 }}
                className={`h-24 w-40 rounded-2xl cursor-pointer
                  transition-all
                  ${
                    idx === activeIndex
                      ? "ring-4 ring-red-600 shadow-2xl"
                      : "opacity-60 hover:opacity-100"
                  }`}
                onClick={() => setActiveIndex(idx)}
              >
                <SecureImageCanvas
                  src={getThumbSrc(img)}
                  alt={item.title}
                  watermark={watermark}
                  maxDimension={420}
                  className="h-24 w-40"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-[999]
              flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
          >
            <button
              className="absolute top-6 right-6
                bg-black/60 p-3 rounded-full text-white"
            >
              <X />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-[90vw]
                rounded-3xl shadow-2xl"
            >
              <SecureImageCanvas
                src={getFullSrc(zoomImage)}
                alt={item.title}
                watermark={watermark}
                maxDimension={2600}
                className="max-h-[90vh] max-w-[90vw]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
