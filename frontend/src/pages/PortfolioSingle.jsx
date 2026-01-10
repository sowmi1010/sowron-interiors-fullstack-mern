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

  /* ================= LOAD ================= */
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
      <p className="py-32 text-center text-gray-400">
        Loading project…
      </p>
    );
  }

  if (!item) {
    return (
      <p className="py-32 text-center text-gray-400">
        Project not found
      </p>
    );
  }

  const heroImage = item.images?.[0]?.url;

  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title={`${item.title} | Sowron Interiors Portfolio`}
        description={
          item.description ||
          "Premium turnkey interior project by Sowron Interiors. Luxury residential and commercial interiors."
        }
        keywords="interior project, luxury interiors, turnkey interiors, Sowron Interiors"
      />

      <section
        className="
          min-h-screen
          bg-white dark:bg-[#0a0a0a]
          text-gray-900 dark:text-gray-100
        "
      >
        {/* ================= BACK ================= */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <button
            onClick={() => navigate(-1)}
            className="
              inline-flex items-center gap-2
              text-sm font-medium
              text-gray-600 dark:text-gray-300
              hover:text-red-600 transition
            "
          >
            <ArrowLeft size={16} /> Back to Portfolio
          </button>
        </div>

        {/* ================= HERO ================= */}
        {heroImage && (
          <section className="relative mt-8">
            <div className="max-w-7xl mx-auto px-6">
              <motion.img
                src={heroImage}
                alt={item.title}
                loading="lazy"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9 }}
                className="
                  w-full h-[320px] md:h-[480px]
                  object-cover rounded-3xl
                "
              />
            </div>
          </section>
        )}

        {/* ================= TITLE ================= */}
        <section className="max-w-4xl mx-auto px-6 pt-14 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            {item.title}
          </motion.h1>

          {item.location && (
            <p className="mt-3 flex justify-center items-center gap-2
                          text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={15} /> {item.location}
            </p>
          )}

          <span
            className="
              block mx-auto mt-6 w-20 h-[3px]
              bg-gradient-to-r from-red-600 to-yellow-400
              rounded-full
            "
          />
        </section>

        {/* ================= DESCRIPTION ================= */}
        {item.description && (
          <section className="max-w-3xl mx-auto px-6 pt-12">
            <p className="text-lg leading-8 text-gray-700 dark:text-gray-300 text-center">
              {item.description}
            </p>
          </section>
        )}

        {/* ================= STATS ================= */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              ["120+", "Projects"],
              ["6+", "Cities"],
              ["5+", "Years"],
              ["300+", "Clients"],
            ].map(([val, label], i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.06 }}
                className="transition"
              >
                <p className="text-4xl font-extrabold text-red-600">
                  {val}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= GALLERY ================= */}
        {item.images?.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {item.images.map((img, idx) => (
                <motion.img
                  key={img.public_id || idx}
                  src={img.url}
                  alt={`${item.title} interior image ${idx + 1}`}
                  loading="lazy"
                  onClick={() => setPreview(img.url)}
                  whileHover={{ scale: 1.02 }}
                  className="
                    w-full h-[260px]
                    object-cover rounded-2xl
                    cursor-pointer
                    transition
                  "
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= CTA ================= */}
        <section className="bg-gray-50 dark:bg-[#111] py-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">
              Want a Similar Interior?
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Share your details — our design expert will contact you shortly.
            </p>

            <div className="mt-8">
              <EnquiryForm />
            </div>
          </div>
        </section>
      </section>

      {/* ================= LIGHTBOX ================= */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="
              fixed inset-0 z-50
              bg-black/90
              flex items-center justify-center
              p-4
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <button
              className="
                absolute top-6 right-6
                bg-white/20 hover:bg-white/30
                text-white p-2 rounded-full
              "
              onClick={() => setPreview(null)}
            >
              <X size={22} />
            </button>

            <motion.img
              src={preview}
              alt="Interior project preview"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-h-[90vh] rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
