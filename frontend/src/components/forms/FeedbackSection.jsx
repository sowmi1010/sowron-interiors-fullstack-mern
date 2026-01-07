import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Star, User } from "lucide-react";
import { motion } from "framer-motion";

export default function FeedbackSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔄 LOAD FEEDBACK */
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

  if (loading) {
    return (
      <section className="py-24 text-center text-gray-400">
        Loading testimonials…
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
    <section className="py-24 bg-white dark:bg-[#050505]
                        text-gray-900 dark:text-gray-100">

      {/* TITLE */}
      <h2 className="text-4xl font-extrabold text-center mb-4
                     bg-gradient-to-r from-orange-500 to-yellow-300
                     bg-clip-text text-transparent">
        Customer Stories
      </h2>

      <p className="text-center opacity-70 text-sm mb-16">
        Real homes. Real results. Real transformations.
      </p>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-6
                      grid gap-10 grid-cols-1 sm:grid-cols-2">
        {reviews.map((r, i) => {
          const rating = Math.min(
            Math.max(Number(r.rating) || 0, 1),
            5
          );

          return (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="
                rounded-2xl p-8 shadow-xl
                bg-white border border-gray-200 
                dark:bg-gradient-to-br dark:from-[#0b0b0b] dark:to-[#171717]
                dark:border-white/10 dark:shadow-orange-500/10
              "
            >
              {/* RATING */}
              <div className="flex mb-3">
                {[...Array(rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-orange-400"
                    fill="orange"
                  />
                ))}
              </div>

              {/* MESSAGE */}
              {r.message && (
                <p className="text-[15px] leading-relaxed opacity-85 mb-6">
                  “{r.message}”
                </p>
              )}

              {/* USER */}
              <div className="flex items-center gap-3">
                {r.photo?.url ? (
                  <img
                    src={r.photo.url}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex
                                  items-center justify-center
                                  bg-orange-100 dark:bg-orange-500/20">
                    <User size={18} className="text-orange-500" />
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
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
