// src/pages/Portfolio.jsx
import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { motion, useAnimation, useInView } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  /* ================= LOAD PORTFOLIO ================= */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get("/portfolio");
        if (mounted) {
          setProjects(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);

    return () => {
      mounted = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const blur = Math.min(scrollY / 50, 8);

  return (
    <div className="relative min-h-screen bg-[#f5f4f2] dark:bg-[#050505]
                    text-gray-800 dark:text-gray-200 overflow-x-hidden">

      <FloatingLights />

      {/* HERO */}
      <section className="relative h-[360px] md:h-[460px] w-full overflow-hidden shadow-xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover transition"
          style={{ filter: `blur(${blur}px) brightness(${1 - blur * 0.04})` }}
          src="/v3.mp4"
        />
        <div className="absolute inset-0 bg-black/45 dark:bg-black/55" />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          className="relative z-10 flex flex-col justify-center
                     items-center h-full text-center"
        >
          <h1 className="text-white drop-shadow-xl
                         text-4xl md:text-6xl font-extrabold">
            Completed Premium Projects
          </h1>
          <p className="text-gray-200 text-sm md:text-base mt-3">
            Crafted spaces that redefine luxury & comfort
          </p>
        </motion.div>
      </section>

      {/* INTRO */}
      <div className="text-center py-14 px-6">
        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl mx-auto">
          Browse through our curated masterpieces – designed with fine
          interior craftsmanship, premium materials, and modern elegance.
        </p>
      </div>

      {/* GRID */}
      <div className="px-6 md:px-20 grid sm:grid-cols-2
                      lg:grid-cols-3 xl:grid-cols-4 gap-14 pb-32">
        {loading && (
          <p className="col-span-full text-center text-gray-500">
            Loading projects…
          </p>
        )}

        {!loading &&
          projects.map((p, i) => (
            <ProjectCard project={p} index={i} key={p._id} />
          ))}

        {!loading && projects.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No Projects Found
          </p>
        )}
      </div>
    </div>
  );
}

/* ================= FLOATING LIGHTS ================= */
function FloatingLights() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.25, 0.7, 0.25],
            scale: [1, 1.45, 1],
            y: [-90, 150, -90],
          }}
          transition={{
            duration: 11 + i * 0.4,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="absolute rounded-full bg-orange-300/10 blur-[45px]"
          style={{
            width: 80 + i * 4,
            height: 80 + i * 4,
            left: `${(i * 17) % 100}%`,
            top: `${(i * 11) % 90}%`,
          }}
        />
      ))}
    </div>
  );
}

/* ================= PROJECT CARD ================= */
function ProjectCard({ project, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start({ opacity: 1, y: 0 });
  }, [inView, controls]);

  const imageUrl = project.images?.[0]?.url;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      transition={{ duration: 0.75, delay: index * 0.06 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="relative cursor-pointer rounded-[28px]
                 overflow-hidden border border-white/25
                 dark:border-[#2c2c2c] shadow-xl
                 bg-white/40 dark:bg-[#161616]/50
                 hover:shadow-orange-500/25 transition-all"
    >
      {/* IMAGE */}
      <div className="overflow-hidden h-[240px] w-full bg-[#111]">
        {imageUrl && (
          <motion.img
            whileHover={{ scale: 1.18 }}
            transition={{ duration: 0.7 }}
            src={imageUrl}
            className="h-full w-full object-cover"
            alt={project.title}
          />
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <h3 className="font-bold text-xl truncate">
          {project.title}
        </h3>

        {project.location && (
          <p className="mt-1 text-sm flex items-center gap-1
                        text-gray-600 dark:text-gray-300">
            <MapPin size={15} /> {project.location}
          </p>
        )}

        <Link
          to={`/portfolio/${project._id}`}
          className="mt-4 inline-flex items-center gap-2
                     text-orange-500 hover:text-orange-600
                     font-semibold transition"
        >
          View Project <ArrowRight size={15} />
        </Link>
      </div>
    </motion.div>
  );
}
