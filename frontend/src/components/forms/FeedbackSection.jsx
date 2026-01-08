import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Star, User } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD FEEDBACK ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/feedback");
        setReviews(res.data || []);
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
      <section className="py-28 text-center text-gray-400">
        Loading customer stories…
      </section>
    );
  }

  if (!reviews.length) {
    return (
      <section className="py-28 text-center text-gray-400">
        No customer feedback available yet.
      </section>
    );
  }

  return (
    <section
      className="
        relative py-32 overflow-hidden
        bg-gradient-to-b from-white via-white to-yellow-50/30
        dark:from-[#050505] dark:via-[#0b0b0b] dark:to-black
        text-gray-900 dark:text-gray-100
      "
    >
      {/* ================= SOFT BACKGROUND ORBS ================= */}
      <motion.div
        animate={{ y: [0, -60, 0], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-20 left-1/3 w-[420px] h-[420px]
                   bg-red-600/25 blur-[200px] rounded-full"
      />

      <motion.div
        animate={{ y: [0, 60, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-0 right-1/4 w-[520px] h-[520px]
                   bg-yellow-400/25 blur-[240px] rounded-full"
      />

      {/* ================= TITLE ================= */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-6"
      >
        Customer Stories
        <span
          className="
            block mx-auto mt-4 w-24 h-[3px] rounded-full
            bg-gradient-to-r from-red-600 to-yellow-400
          "
        />
      </motion.h2>

      <p className="text-center opacity-70 text-sm mb-20">
        Real homes. Real results. Real transformations.
      </p>

      {/* ================= GRID ================= */}
      <div
        className="
          relative z-10 max-w-6xl mx-auto px-6
          grid gap-10 grid-cols-1 sm:grid-cols-2
        "
      >
        {reviews.map((r, i) => {
          const rating = Math.min(Math.max(Number(r.rating) || 0, 1), 5);

          return (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="
                relative rounded-2xl p-8
                bg-white/80 dark:bg-white/5 backdrop-blur-xl
                border border-red-200/40 dark:border-white/10
                shadow-xl hover:shadow-red-600/20
                transition-all
              "
            >
              {/* ================= RATING ================= */}
              <div className="flex mb-4 gap-1">
                {[...Array(rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-yellow-400"
                    fill="#FACC15"
                  />
                ))}
              </div>

              {/* ================= MESSAGE ================= */}
              {r.message && (
                <p className="text-[15px] leading-relaxed opacity-85 mb-6">
                  “{r.message}”
                </p>
              )}

              {/* ================= USER ================= */}
              <div className="flex items-center gap-4">
                {r.photo?.url ? (
                  <img
                    src={r.photo.url}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover border
                               border-yellow-400/40"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/avatar.png";
                    }}
                  />
                ) : (
                  <div
                    className="
                      w-12 h-12 rounded-full flex items-center justify-center
                      bg-red-100 dark:bg-red-500/20
                    "
                  >
                    <User size={18} className="text-red-600 dark:text-red-400" />
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

              {/* ================= CARD ACCENT ================= */}
              <span
                className="
                  absolute top-0 right-0 w-16 h-16
                  bg-gradient-to-bl from-yellow-400/20 to-transparent
                  rounded-tr-2xl
                "
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
