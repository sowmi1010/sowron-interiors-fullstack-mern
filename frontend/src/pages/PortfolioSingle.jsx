import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowLeft, X } from "lucide-react";
import EnquiryForm from "../components/forms/EnquiryForm";
import SEO from "../components/SEO";

const HERO_INTERVAL = 4000;

export default function PortfolioSingle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const intervalRef = useRef(null);

  const [previewSrc, setPreviewSrc] = useState(null);

  // NEW: avoid hero flicker + ensure sharp load
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/portfolio/${id}`);
        setItem(res.data || null);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const images = useMemo(() => item?.images || [], [item]);

  const heroImages = useMemo(() => {
    return (images || [])
      .slice(0, 6)
      .map((img) => img.fullUrl || img.mediumUrl || img.url)
      .filter(Boolean);
  }, [images]);

  // hero autoplay
  useEffect(() => {
    if (!heroImages.length) return;
    setHeroIndex(0);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (heroPaused) return;
      setHeroIndex((p) => (p + 1) % heroImages.length);
    }, HERO_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [heroImages.length, heroPaused]);

  // NEW: preload hero image so it looks clear instantly
  useEffect(() => {
    if (!heroImages.length) return;
    setHeroReady(false);
    const img = new Image();
    img.src = heroImages[heroIndex];
    img.onload = () => setHeroReady(true);
  }, [heroImages, heroIndex]);

  // ESC close preview
  useEffect(() => {
    if (!previewSrc) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPreviewSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewSrc]);

  if (loading) {
    return (
      <div className="min-h-[70vh] grid place-items-center bg-white dark:bg-[#070A12] text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border border-black/10 dark:border-white/20 border-t-black/70 dark:border-t-white/80 animate-spin" />
          <p className="mt-4 text-sm text-black/60 dark:text-white/60 tracking-wide">
            Loading project…
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[70vh] grid place-items-center bg-white dark:bg-[#070A12] text-gray-900 dark:text-white">
        <p className="text-black/60 dark:text-white/60">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${item.title} | Sowron Interiors`} description={item.description} />

      <section className="bg-white text-gray-900 dark:bg-[#070A12] dark:text-white">
        {/* TOP BAR */}
        <div className="max-w-7xl mt-14 mx-auto px-6 pt-10 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium
              text-black/60 hover:text-black transition
              dark:text-white/70 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </button>
        </div>

        {/* HERO AUTO SLIDER (premium + clear) */}
        {heroImages.length > 0 && (
          <section className="relative mt-10">
            <div className="max-w-7xl mx-auto px-6">
              <div
                className="relative overflow-hidden rounded-[2.75rem]
                  shadow-[0_30px_80px_rgba(0,0,0,0.25)]
                  dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
                onMouseEnter={() => setHeroPaused(true)}
                onMouseLeave={() => setHeroPaused(false)}
              >
                {/* blur glow behind (keep only background blur) */}
                <div className="absolute inset-0">
                  <img
                    src={heroImages[heroIndex]}
                    alt=""
                    className="w-full h-full object-cover scale-110 blur-3xl opacity-30"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/55 dark:from-black/25 dark:to-black/80" />
                </div>

                {/* main hero (sharp + premium zoom) */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={heroIndex}
                    src={heroImages[heroIndex]}
                    alt={item.title}
                    // smooth fade between slides
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: heroReady ? 1 : 0,
                      scale: 1.0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative w-full h-[420px] md:h-[580px] object-cover object-center
                      [image-rendering:auto] will-change-transform"
                    loading="eager"
                    decoding="async"
                    // sharpness boosts (no layout change)
                    style={{
                      filter: "contrast(1.08) saturate(1.12) brightness(1.02)",
                      transform: "translateZ(0)",
                    }}
                  />
                </AnimatePresence>

                {/* Ken Burns premium animation layer (no blur, very subtle) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`kb-${heroIndex}`}
                    className="absolute inset-0"
                    initial={{ scale: 1.02 }}
                    animate={{ scale: 1.08 }}
                    exit={{ scale: 1.02 }}
                    transition={{ duration: 6.5, ease: "easeOut" }}
                    aria-hidden="true"
                  >
                    <img
                      src={heroImages[heroIndex]}
                      alt=""
                      className="w-full h-full object-cover object-center opacity-[0.0001]"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.06),rgba(0,0,0,0.75))] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0.12),rgba(0,0,0,0.85))]" />

                {/* title */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="max-w-4xl">
                    <motion.h1
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="text-3xl md:text-5xl font-extrabold tracking-tight text-white"
                    >
                      {item.title}
                    </motion.h1>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.6 }}
                      className="mt-4 flex flex-wrap items-center gap-3"
                    >
                      {item.location && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/85">
                          <MapPin size={14} /> {item.location}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber-100">
                        Premium Interior
                      </span>
                    </motion.div>

                    {/* dots */}
                    {heroImages.length > 1 && (
                      <div className="mt-7 flex items-center gap-2">
                        {heroImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setHeroIndex(i)}
                            className={`h-2.5 rounded-full transition ${
                              i === heroIndex
                                ? "w-8 bg-amber-300"
                                : "w-2.5 bg-white/35 hover:bg-white/55"
                            }`}
                            aria-label={`Go to hero slide ${i + 1}`}
                            type="button"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STORY */}
        {item.description && (
          <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-20 text-center">
            <p className="text-base md:text-lg leading-8 text-black/70 dark:text-white/75">
              {item.description}
            </p>
          </section>
        )}

        {/* GALLERY GRID (single preview only) */}
        {images.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-28 md:pb-32">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Gallery
                </h2>
                <p className="mt-2 text-sm text-black/55 dark:text-white/60">
                  Click any image → preview opens (single image).
                </p>
              </div>

              <div className="hidden md:block text-xs uppercase tracking-[0.3em] text-black/45 dark:text-white/50">
                {images.length} Photos
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {images.map((img, idx) => {
                const cardSrc = img.thumbUrl || img.mediumUrl || img.url;
                const fullSrc = img.fullUrl || img.mediumUrl || img.url;

                return (
                  <motion.button
                    type="button"
                    key={idx}
                    onClick={() => setPreviewSrc(fullSrc)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden rounded-[2.25rem]
                      border border-black/10 bg-white/60
                      shadow-[0_20px_50px_rgba(0,0,0,0.12)]
                      dark:border-white/10 dark:bg-white/5
                      dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]
                      focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                  >
                    <div className="aspect-[4/3] w-full">
                      <img
                        src={cardSrc}
                        alt={`${item.title} image ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-700
                          group-hover:scale-[1.06] group-hover:saturate-110"
                        style={{ filter: "contrast(1.06) saturate(1.08)" }}
                      />
                    </div>

                    <div className="pointer-events-none absolute inset-0 opacity-70 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white/90">
                          View Photo
                        </span>
                        <span className="text-xs text-white/65">
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#f5f5f5] dark:from-[#070A12] dark:via-[#070A12] dark:to-black" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,rgba(245,198,92,0.22),transparent_55%)]" />

          <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Want a Similar Interior?
            </h2>
            <p className="mt-4 text-sm md:text-base mb-14 text-black/60 dark:text-white/65">
              Share your details — our design expert will reach out.
            </p>

            <EnquiryForm
              projectId={item._id}
              projectTitle={item.title}
              projectLocation={item.location}
            />
          </div>
        </section>
      </section>

      {/* SINGLE IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewSrc && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewSrc(null)}
          >
            <motion.div
              className="relative w-full max-w-[1200px]"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewSrc(null)}
                className="absolute -top-14 right-0 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full border border-white/15 transition"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <motion.img
                src={previewSrc}
                alt="Preview"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.25 }}
                className="w-full max-h-[80vh] object-contain rounded-[2rem]
                  shadow-[0_35px_90px_rgba(0,0,0,0.7)]
                  border border-white/10 bg-black/20"
                style={{ filter: "contrast(1.05) saturate(1.06)" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
