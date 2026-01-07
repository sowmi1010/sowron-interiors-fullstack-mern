// src/pages/PortfolioSingle.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EnquiryForm from "../components/forms/EnquiryForm";
import { MapPin, X } from "lucide-react";

export default function PortfolioSingle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD SINGLE PORTFOLIO ================= */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/portfolio/${id}`);
        if (mounted) setItem(res.data || null);
      } catch {
        if (mounted) setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <p className="text-center p-10 text-gray-400 dark:text-gray-300">
        Loading project…
      </p>
    );
  }

  if (!item) {
    return (
      <p className="text-center p-10 text-gray-400 dark:text-gray-300">
        Project not found
      </p>
    );
  }

  const heroImage = item.images?.[0]?.url;

  return (
    <div className="relative bg-gray-50 dark:bg-[#070707]
                    text-gray-800 dark:text-gray-100
                    min-h-screen overflow-hidden">

      <AnimatedBubbles />
      <NoiseOverlay />

      {/* HERO */}
      {heroImage && (
        <HeroSection item={item} heroImage={heroImage} />
      )}

      {/* DESCRIPTION */}
      {item.description && (
        <section className="px-6 md:px-20 py-14">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-lg max-w-3xl leading-relaxed
                       text-gray-600 dark:text-gray-300"
          >
            {item.description}
          </motion.p>
        </section>
      )}

      {/* STATS */}
      <StatsStrip />

      {/* GALLERY */}
      {item.images?.length > 0 && (
        <GalleryGrid images={item.images} setPreview={setPreview} />
      )}

      {/* LIGHTBOX */}
      <ImagePreview preview={preview} setPreview={setPreview} />

      {/* CTA */}
      <EnquiryCTA />
    </div>
  );
}

/* ================= HERO ================= */
function HeroSection({ item, heroImage }) {
  return (
    <section className="relative h-[380px] md:h-[450px]
                        overflow-hidden shadow-xl">
      <motion.img
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4 }}
        src={heroImage}
        className="absolute inset-0 w-full h-full object-cover"
        alt={item.title}
      />

      <div className="absolute inset-0
                      bg-gradient-to-b
                      from-black/60 via-black/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.9 }}
        className="absolute bottom-12 left-0 w-full
                   px-6 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold
                       text-transparent bg-clip-text
                       bg-gradient-to-r from-yellow-300
                       to-orange-500 drop-shadow-lg">
          {item.title}
        </h1>

        {item.location && (
          <p className="mt-2 flex justify-center items-center
                        gap-2 text-gray-200 text-lg">
            <MapPin size={18} /> {item.location}
          </p>
        )}
      </motion.div>
    </section>
  );
}

/* ================= STATS ================= */
function StatsStrip() {
  const stats = [
    ["Completed Projects", "120+"],
    ["Cities Served", "6+"],
    ["Years", "5+"],
    ["Happy Clients", "300+"],
  ];

  return (
    <section className="px-6 md:px-20 pb-14">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {stats.map(([label, value], i) => (
          <motion.div key={i} whileHover={{ scale: 1.08 }}>
            <p className="text-4xl font-extrabold
                          bg-gradient-to-r
                          from-orange-500 to-yellow-400
                          bg-clip-text text-transparent">
              {value}
            </p>
            <p className="text-sm text-gray-600
                          dark:text-gray-400 mt-1">
              {label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ================= GALLERY GRID ================= */
function GalleryGrid({ images, setPreview }) {
  return (
    <section className="px-6 md:px-20 pb-20">
      <div className="columns-2 sm:columns-3 lg:columns-4
                      gap-4 space-y-4">
        {images.map((img, idx) => (
          <motion.img
            key={img.public_id || idx}
            src={img.url}
            onClick={() => setPreview(img.url)}
            className="w-full rounded-xl cursor-pointer
                       hover:scale-[1.03]
                       transition-all duration-300
                       shadow-md"
            loading="lazy"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            alt=""
          />
        ))}
      </div>
    </section>
  );
}

/* ================= LIGHTBOX ================= */
function ImagePreview({ preview, setPreview }) {
  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          className="fixed inset-0 bg-black/90
                     backdrop-blur-xl
                     flex justify-center items-center
                     p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute top-6 right-6 text-white
                       bg-white/20 hover:bg-white/30
                       px-3 py-2 rounded-lg"
            onClick={() => setPreview(null)}
          >
            <X size={24} />
          </button>

          <motion.img
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            src={preview}
            className="max-h-[88vh] rounded-xl
                       shadow-2xl border border-white/10"
            alt=""
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= CTA ================= */
function EnquiryCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="px-6 md:px-20 pb-32"
    >
      <div className="max-w-3xl mx-auto text-center
                      p-10 rounded-3xl
                      bg-white dark:bg-[#101010]
                      shadow-xl">
        <h2 className="text-3xl font-bold mb-2">
          Interested in Similar Luxury?
        </h2>
        <p className="text-sm text-gray-600
                      dark:text-gray-400">
          Submit your details — our expert will call back within 30 minutes.
        </p>
        <div className="max-w-md mx-auto mt-6">
          <EnquiryForm />
        </div>
      </div>
    </motion.section>
  );
}

/* ================= EFFECTS ================= */
function AnimatedBubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full
                     bg-orange-400/10 blur-[45px]"
          animate={{
            y: [-80, 100, -80],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 12 + i, repeat: Infinity }}
          style={{
            width: 90 + i * 5,
            height: 90 + i * 5,
            left: `${(i * 15) % 100}%`,
            top: `${(i * 11) % 90}%`,
          }}
        />
      ))}
    </div>
  );
}

function NoiseOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0
                      bg-[url('/i11.jpg')]
                      opacity-[0.10]
                      mix-blend-soft-light" />
      <div className="absolute inset-0
                      bg-gradient-to-b
                      from-black/20 to-transparent" />
      <div className="absolute inset-0
                      backdrop-blur-[1px]" />
    </div>
  );
}
