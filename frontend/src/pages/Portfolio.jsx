import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Portfolio | Sowron Interiors – Premium Projects</title>
        <meta
          name="description"
          content="Explore premium turnkey interior projects by Sowron Interiors. Crafted spaces with luxury materials and expert execution."
        />
      </Helmet>

      <section
        className="
          relative min-h-screen overflow-hidden
          bg-gradient-to-b from-white via-white to-yellow-50/30
          dark:from-[#050505] dark:via-[#0b0b0b] dark:to-black
          text-gray-900 dark:text-gray-100
        "
      >
        {/* ================= HERO ================= */}
        <div className="relative h-[380px] md:h-[520px] overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            src="/v3.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1 }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          >
            <span className="text-yellow-400 tracking-widest text-xs uppercase mb-4">
              Selected Works
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white">
              Signature Interior Projects
            </h1>
            <p className="mt-4 text-sm md:text-base text-gray-200 max-w-2xl">
              Each project reflects our commitment to precision, craftsmanship,
              and timeless design.
            </p>
          </motion.div>
        </div>

        {/* ================= INTRO ================= */}
        <div className="max-w-3xl mx-auto text-center py-20 px-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-7">
            Our portfolio showcases luxury residential and commercial interiors
            designed with thoughtful layouts, premium finishes, and seamless
            execution — crafted to elevate everyday living.
          </p>
        </div>

        {/* ================= GRID ================= */}
        <div className="max-w-[1600px] mx-auto px-6 pb-32 grid
                        grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                        gap-14">
          {loading && (
            <p className="col-span-full text-center text-gray-400">
              Loading projects…
            </p>
          )}

          {!loading && projects.length === 0 && (
            <p className="col-span-full text-center text-gray-400">
              No projects available
            </p>
          )}

          {projects.map((p, i) => (
            <PortfolioCard key={p._id} project={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= PORTFOLIO CARD ================= */
function PortfolioCard({ project, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const imageUrl = project.images?.[0]?.url;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.06 }}
      whileHover={{ y: -8 }}
      className="
        group relative rounded-[28px] overflow-hidden
        bg-white dark:bg-[#141414]
        border border-red-200/40 dark:border-white/10
        shadow-xl hover:shadow-red-600/20
        transition-all
      "
    >
      {/* IMAGE */}
      <div className="relative h-[260px] overflow-hidden bg-black">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={project.title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.12 }}
            transition={{ duration: 0.8 }}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-[#111]" />
        )}

        {/* OVERLAY */}
        <div
          className="
            absolute inset-0 bg-gradient-to-t
            from-black/70 via-black/30 to-transparent
            opacity-0 group-hover:opacity-100
            transition
          "
        />
      </div>

      {/* CONTENT */}
      <div className="p-6 relative">
        <h3 className="font-bold text-xl truncate">
          {project.title}
        </h3>

        {project.location && (
          <p className="mt-1 text-sm flex items-center gap-1
                        text-gray-600 dark:text-gray-300">
            <MapPin size={14} /> {project.location}
          </p>
        )}

        <Link
          to={`/portfolio/${project._id}`}
          className="
            mt-5 inline-flex items-center gap-2
            text-red-600 dark:text-red-400
            font-semibold group-hover:text-yellow-400
            transition
          "
        >
          View Project
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* CARD ACCENT */}
      <span
        className="
          absolute top-0 right-0 w-24 h-24
          bg-gradient-to-bl from-yellow-400/25 to-transparent
        "
      />
    </motion.div>
  );
}
