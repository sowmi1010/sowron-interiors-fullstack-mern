import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trash2, Heart } from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD WISHLIST ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/wishlist");
        setItems(res.data || []);
      } catch {
        toast.error("Login to view wishlist");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= REMOVE ================= */
  const removeItem = async (id) => {
    try {
      await api.delete(`/wishlist/remove/${id}`);
      setItems((p) => p.filter((x) => x._id !== id));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <>
      <SEO
        title="Wishlist | Sowron Interiors"
        description="Your favorite furniture and interior products saved for later."
        keywords="wishlist, saved products, favorite furniture"
      />

      <section className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-28 pb-24">

        {/* ================= HEADER ================= */}
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Your Wishlist
          </motion.h1>

          <div className="mx-auto mt-4 w-24 h-[3px] bg-gradient-to-r from-red-600 to-yellow-400 rounded-full" />

          <p className="mt-6 opacity-70">
            Save your favorite designs and products for later
          </p>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-6">

          {loading ? (
            <p className="text-center opacity-60 py-20">Loading wishlist...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-32">
              <Heart size={60} className="mx-auto opacity-20" />
              <p className="mt-6 text-lg opacity-60">Your wishlist is empty</p>
              <Link
                to="/products"
                className="inline-block mt-6 px-8 py-3 rounded-xl bg-red-600 text-white font-semibold hover:scale-105 transition"
              >
                Browse Products →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {items.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-[#121212] shadow-xl border border-gray-200 dark:border-white/10"
                >
                  {/* IMAGE */}
                  <Link to={`/products/${p._id}`}>
                    {p.images?.[0]?.url ? (
                      <motion.img
                        src={p.images[0].url}
                        alt={p.title}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6 }}
                        className="h-[260px] w-full object-cover"
                      />
                    ) : (
                      <div className="h-[260px] bg-gray-200 dark:bg-[#0f0f0f]" />
                    )}
                  </Link>

                  {/* CONTENT */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg">{p.title}</h3>
                    <p className="text-sm opacity-60">{p.category?.name}</p>

                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-lg font-bold text-red-600">
                        ₹ {p.price}
                      </p>

                      <button
                        onClick={() => removeItem(p._id)}
                        className="flex items-center gap-2 text-sm text-red-600 hover:scale-110 transition"
                      >
                        <Trash2 size={18} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
