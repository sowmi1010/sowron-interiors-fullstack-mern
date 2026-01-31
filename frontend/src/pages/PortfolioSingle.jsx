import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowLeft, X } from "lucide-react";
import EnquiryForm from "../components/forms/EnquiryForm";
import SEO from "../components/SEO";

export default function PortfolioSingle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <p className="py-40 text-center text-gray-400">
        Loading project…
      </p>
    );
  }

  if (!item) {
    return (
      <p className="py-40 text-center text-gray-400">
        Project not found
      </p>
    );
  }

  const heroImage = item.images?.[0]?.url;

  return (
    <>
      <SEO
        title={`${item.title} | Sowron Interiors`}
        description={item.description}
      />

      <section className="bg-white dark:bg-[#0b0b0b] text-gray-900 dark:text-gray-100">

        {/* ================= BACK ================= */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2
              text-sm font-medium opacity-70
              hover:opacity-100 transition"
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </button>
        </div>

        {/* ================= HERO ================= */}
        {heroImage && (
          <section className="relative mt-10">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative overflow-hidden rounded-[3rem] shadow-2xl"
              >
                <img
                  src={heroImage}
                  alt={item.title}
                  className="w-full h-[360px] md:h-[520px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </motion.div>
            </div>
          </section>
        )}

        {/* ================= TITLE ================= */}
        <section className="max-w-4xl mx-auto px-6 pt-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            {item.title}
          </motion.h1>

          {item.location && (
            <p className="mt-4 flex justify-center items-center gap-2
              text-sm uppercase tracking-widest opacity-70">
              <MapPin size={14} /> {item.location}
            </p>
          )}

          <span className="block mx-auto mt-8 w-24 h-[2px]
            bg-gradient-to-r from-red-600 to-yellow-400 rounded-full" />
        </section>

        {/* ================= STORY ================= */}
        {item.description && (
          <section className="max-w-3xl mx-auto px-6 pt-14 text-center">
            <p className="text-lg leading-8 text-gray-700 dark:text-gray-300">
              {item.description}
            </p>
          </section>
        )}

        {/* ================= IMAGE STORY ================= */}
        {item.images?.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 pt-28 pb-32">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {item.images.map((img, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="cursor-pointer"
                  onClick={() => setPreview(img.url)}
                >
                  <img
                    src={img.url}
                    alt={`${item.title} image ${idx + 1}`}
                    className="w-full h-[280px] object-cover
                      rounded-3xl shadow-xl"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ================= CTA ================= */}
        <section className="bg-[#fafafa] dark:bg-[#111] py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Want a Similar Interior?
            </h2>
            <p className="mt-4 text-sm opacity-70">
              Share your details — our design expert will reach out.
            </p>

            <div className="mt-10">
              <EnquiryForm />
            </div>
          </div>
        </section>
      </section>

      {/* ================= LIGHTBOX ================= */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95
              flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <button
              className="absolute top-6 right-6
                bg-white/20 hover:bg-white/30
                text-white p-3 rounded-full"
            >
              <X size={20} />
            </button>

            <motion.img
              src={preview}
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="max-h-[90vh] max-w-[90vw]
                rounded-3xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}