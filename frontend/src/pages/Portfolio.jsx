import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Loader2 } from "lucide-react";
import SEO from "../components/SEO";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [visible, setVisible] = useState(6);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/portfolio");
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    window.scrollTo(0, 0);
  }, []);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisible((p) => p + 6);
      setLoadingMore(false);
    }, 1200);
  };

  return (
    <>
      <SEO
        title="Portfolio | Sowron Interiors – Signature Projects"
        description="Explore signature luxury interior projects by Sowron Interiors."
      />

      <section className="relative min-h-screen bg-brand-lightBg dark:bg-brand-darkBg text-brand-lightText dark:text-brand-darkText transition-colors overflow-hidden">

        {/* ================= CINEMATIC HERO ================= */}
        <div className="relative h-[420px] md:h-[580px] overflow-hidden">

          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/v3.mp4"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

          {/* Floating luxury glows */}
          <motion.div
            animate={{ y: [0, -60, 0], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 14, repeat: Infinity }}
            className="absolute top-24 left-1/4 w-[420px] h-[420px] bg-brand-red/30 blur-[220px] rounded-full"
          />

          <motion.div
            animate={{ y: [0, 80, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 16, repeat: Infinity }}
            className="absolute bottom-0 right-1/4 w-[520px] h-[520px] bg-brand-yellow/25 blur-[260px] rounded-full"
          />

          {/* Hero content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-brand-yellow tracking-widest text-xs uppercase mb-4"
            >
              Our Masterpieces
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
            >
              Signature Interior Projects
            </motion.h1>

            <p className="mt-6 text-gray-200 max-w-2xl text-lg leading-relaxed">
              A curated collection of luxury homes and commercial interiors —
              crafted with precision, passion and perfection.
            </p>
          </div>
        </div>

        {/* ================= INTRO ================= */}
        <div className="max-w-4xl mx-auto text-center py-24 px-6">
          <p className="text-brand-lightSubText dark:text-brand-darkSubText text-base md:text-lg leading-8">
            Every Sowron project is a blend of thoughtful design, premium materials,
            and flawless execution. Our interiors are built for timeless living.
          </p>
        </div>

        {/* ================= GRID ================= */}
        <div className="relative max-w-[1600px] mx-auto px-6 pb-24 grid
                        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                        gap-16">

          {loading &&
            [...Array(6)].map((_, i) => <Skeleton key={i} />)}

          {!loading &&
            projects.slice(0, visible).map((p, i) => (
              <PortfolioCard key={p._id} project={p} index={i} />
            ))}
        </div>

        {/* ================= LOAD MORE ================= */}
        {visible < projects.length && (
          <div className="flex justify-center pb-32">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="
                flex items-center gap-3 px-12 py-5 rounded-full
                bg-gradient-to-r from-brand-red to-brand-yellow
                text-black font-semibold text-lg
                shadow-glow hover:scale-105 transition
              "
            >
              {loadingMore ? (
                <>
                  <Loader2 className="animate-spin" /> Loading...
                </>
              ) : (
                "Load More Projects"
              )}
            </button>
          </div>
        )}
      </section>
    </>
  );
}

/* ================= CARD ================= */
function PortfolioCard({ project, index }) {
  const imageUrl = project.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay: index * 0.08 }}
      whileHover={{ y: -12 }}
      className="
        group relative rounded-[36px] overflow-hidden
        bg-brand-lightCard dark:bg-brand-darkCard
        border border-brand-yellow/30 dark:border-white/10
        shadow-card hover:shadow-glow
        transition-all
      "
    >
      {/* IMAGE */}
      <div className="relative h-[300px] overflow-hidden bg-black">
        {imageUrl && (
          <motion.img
            src={imageUrl}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.18 }}
            transition={{ duration: 1 }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>

      {/* CONTENT */}
      <div className="p-8 relative z-10">
        <h3 className="font-bold text-xl tracking-wide truncate">
          {project.title}
        </h3>

        {project.location && (
          <p className="mt-2 text-sm flex items-center gap-2 opacity-70">
            <MapPin size={14} /> {project.location}
          </p>
        )}

        <Link
          to={`/portfolio/${project._id}`}
          className="
            mt-6 inline-flex items-center gap-2
            text-brand-red dark:text-brand-yellow
            font-semibold tracking-wide
            group-hover:translate-x-1 transition
          "
        >
          View Project
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Corner accent */}
      <span className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-yellow/25 to-transparent" />
    </motion.div>
  );
}

/* ================= SKELETON LOADER ================= */
function Skeleton() {
  return (
    <div className="rounded-[36px] overflow-hidden bg-gray-200 dark:bg-[#111] animate-pulse">
      <div className="h-[300px] bg-gray-300 dark:bg-[#222]" />
      <div className="p-8 space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-[#222] rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-[#222] rounded w-1/2" />
        <div className="h-4 bg-gray-300 dark:bg-[#222] rounded w-2/3" />
      </div>
    </div>
  );
}
