import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Star, User, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD FEEDBACK ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/feedback", {
          params: { page: 1, limit: 6 },
        });
        const payload = res.data || {};
        setReviews(
          Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload)
            ? payload
            : []
        );
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <section className="py-24 text-center text-gray-400">
        Loading customer stories…
      </section>
    );
  }

  if (!reviews.length) {
    return (
      <section className="py-24 text-center text-gray-400">
        No customer feedback available yet.
      </section>
    );
  }

  return (
    <section
      className="
        relative py-24 md:py-32 overflow-hidden
        bg-gradient-to-b from-white via-white to-brand-yellowSoft/30
        dark:from-[#050505] dark:via-[#0b0b0b] dark:to-black
        text-brand-lightText dark:text-brand-darkText
      "
    >
      {/* ================= BACKGROUND ORBS ================= */}
      <motion.div
        animate={{ y: [0, -60, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute -top-24 left-1/3 w-[420px] h-[420px]
                   bg-brand-red/20 blur-[220px] rounded-full"
      />

      <motion.div
        animate={{ y: [0, 60, 0], opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 16, repeat: Infinity }}
        className="absolute bottom-0 right-1/4 w-[520px] h-[520px]
                   bg-brand-yellow/20 blur-[260px] rounded-full"
      />

      {/* ================= TITLE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Customer Stories
        </h2>

        <span className="block mx-auto mt-4 w-24 h-[3px] rounded-full bg-gradient-to-r from-brand-red to-brand-yellow" />

        <p className="mt-6 opacity-70 text-sm">
          Real homes. Real results. Real transformations.
        </p>
      </motion.div>

      {/* ================= GRID ================= */}
      <div
        className="
          relative z-10 max-w-6xl mx-auto px-6
          grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        "
      >
        {reviews.map((r, i) => {
          const rating = Math.min(Math.max(Number(r.rating) || 0, 1), 5);

          return (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="
                group relative rounded-2xl p-8
                bg-white/80 dark:bg-white/5 backdrop-blur-xl
                border border-brand-yellow/30 dark:border-white/10
                shadow-xl hover:shadow-brand-red/20
                transition-all
              "
            >
              {/* Quote Icon */}
              <Quote
                size={36}
                className="absolute -top-5 -left-4 text-brand-yellow opacity-30"
              />

              {/* ================= RATING ================= */}
              <div className="flex mb-5 gap-1">
                {[...Array(rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-brand-yellow"
                    fill="#FBC02D"
                  />
                ))}
              </div>

              {/* ================= MESSAGE ================= */}
              {r.message && (
                <p className="text-[15px] leading-relaxed opacity-85 mb-8 italic">
                  “{r.message}”
                </p>
              )}

              {/* ================= USER ================= */}
              <div className="flex items-center gap-4 mt-auto">
                {r.photo?.url ? (
                  <img
                    src={r.photo.thumbUrl || r.photo.mediumUrl || r.photo.url}
                    alt={r.name}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-full object-cover border
                               border-brand-yellow/40"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/avatar.png";
                    }}
                  />
                ) : (
                  <div
                    className="
                      w-12 h-12 rounded-full flex items-center justify-center
                      bg-brand-red/10
                    "
                  >
                    <User size={18} className="text-brand-red" />
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-[15px]">
                    {r.name}
                  </h4>
                  <p className="text-xs opacity-60">
                    {r.city}
                  </p>
                </div>
              </div>

              {/* ================= CARD GLOW ================= */}
              <span
                className="
                  absolute inset-0 rounded-2xl
                  bg-gradient-to-tr from-brand-yellow/10 via-transparent to-transparent
                  opacity-0 group-hover:opacity-100
                  transition
                "
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
