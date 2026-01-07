import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function ViewGallery() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const intervalRef = useRef(null);

  /* LOAD SINGLE ITEM */
  useEffect(() => {
    axios
      .get(`${API}/gallery/item/${id}`)
      .then((res) => setItem(res.data?.item))
      .catch(() => {});
  }, [id]);

  /* AUTO SLIDER */
  useEffect(() => {
    if (!item?.images?.length) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((p) => (p + 1) % item.images.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [item]);

  /* SAFETY */
  if (!item || !item.images?.length) {
    return (
      <p className="text-center py-10 text-gray-400">
        Loading gallery...
      </p>
    );
  }

  const next = () =>
    setActiveIndex((p) => (p + 1) % item.images.length);

  const prev = () =>
    setActiveIndex((p) => (p - 1 + item.images.length) % item.images.length);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] pb-20">

      {/* BACK */}
      <div className="px-6 md:px-20 pt-10">
        <Link
          to="/gallery"
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow"
        >
          <ArrowLeft size={18} /> Back to Gallery
        </Link>
      </div>

      {/* TITLE */}
      <h1 className="text-center text-5xl font-extrabold mt-6 bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
        {item.title}
      </h1>

      <p className="text-center uppercase tracking-wide opacity-70">
        {item.category?.replace(/-/g, " ")}
      </p>

      {/* SLIDER */}
      <div className="px-4 md:px-28 mt-10 relative">
        <div
          className="relative group h-[350px] md:h-[520px] overflow-hidden rounded-3xl shadow-2xl bg-black cursor-pointer"
          onClick={() =>
            setZoomImage(item.images[activeIndex].url)
          }
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 p-3 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 p-3 rounded-full"
          >
            <ChevronRight size={20} />
          </button>

          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              src={item.images[activeIndex].url}
              className="object-cover h-full w-full"
            />
          </AnimatePresence>

          <div className="absolute bottom-4 right-4 bg-white/40 p-2 rounded-lg text-xs flex gap-1">
            <ZoomIn size={16} /> Zoom
          </div>
        </div>
      </div>

      {/* THUMBNAILS */}
      <div className="px-4 md:px-28 mt-6 flex gap-4 overflow-x-auto">
        {item.images.map((img, idx) => (
          <motion.img
            key={img.public_id || idx}
            src={img.url}
            onClick={() => setActiveIndex(idx)}
            className={`h-20 w-32 rounded-xl cursor-pointer ${
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
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999]"
            onClick={() => setZoomImage(null)}
          >
            <motion.img
              src={zoomImage}
              className="max-h-[90vh] max-w-[90vw] rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
