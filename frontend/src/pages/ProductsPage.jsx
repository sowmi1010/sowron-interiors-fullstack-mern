import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Image } from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

/* ================= TYPING TEXT ================= */
const PHRASES = [
  "Premium Furniture Collection",
  "Designed for Modern Living",
  "Crafted with Precision",
  "Built to Elevate Your Space",
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);

  /* ================= AUTO TYPE ================= */
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(PHRASES[index].slice(0, i));
      i++;
      if (i > PHRASES[index].length) {
        clearInterval(interval);
        setTimeout(() => {
          setIndex((p) => (p + 1) % PHRASES.length);
        }, 1600);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [index]);

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        setProducts(res.data || []);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];

  const visible =
    filter === "all"
      ? products
      : products.filter(
          (p) =>
            p.category?.name?.toLowerCase() === filter.toLowerCase()
        );

  const toggleLike = (id) => {
    setLiked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title="Premium Furniture Collection | Sowron Interiors"
        description="Explore premium modular furniture, wardrobes, kitchens and custom interior products by Sowron Interiors."
        keywords="furniture collection, modular furniture, interior products, Sowron Interiors"
      />

      <section className="min-h-screen bg-[#fafafa] dark:bg-[#0b0b0b] text-gray-900 dark:text-gray-100">

        {/* ================= CINEMATIC HERO ================= */}
        <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/v3.mp4"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

          <div className="absolute -top-32 left-1/2 -translate-x-1/2
                          w-[600px] h-[600px]
                          bg-red-500/20 blur-[160px]" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 h-full flex flex-col
                       justify-center items-center text-center px-6"
          >
            <span className="text-yellow-400 tracking-[0.3em] text-xs mb-5">
              SOWRON COLLECTION
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white">
              {text}
              <span className="border-r-2 border-yellow-400 ml-1 animate-pulse" />
            </h1>

            <div className="mt-6 w-24 h-[3px]
                            bg-gradient-to-r from-red-600 to-yellow-400
                            rounded-full" />

            <p className="mt-6 max-w-xl text-gray-300 text-sm md:text-base">
              Discover furniture that blends aesthetics, durability,
              and intelligent craftsmanship — curated exclusively
              for refined interiors.
            </p>
          </motion.div>
        </section>

        {/* ================= CATEGORY BAR ================= */}
        <section className="sticky top-20 z-20 bg-[#fafafa]/90 dark:bg-[#0b0b0b]/90 backdrop-blur border-b border-gray-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${
                    filter === c
                      ? "bg-red-600 text-white"
                      : "bg-white dark:bg-[#161616] text-gray-600 dark:text-gray-300"
                  }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* ================= PRODUCTS ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          {loading ? (
            <p className="text-center text-gray-400 py-20">
              Loading collection…
            </p>
          ) : visible.length === 0 ? (
            <p className="text-center text-gray-400 py-20">
              No products found
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-16">
              {visible.map((p, i) => (
                <motion.article
                  key={p._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="relative rounded-[30px] overflow-hidden shadow-xl">
                    <Link to={`/products/${p._id}`}>
                      {p.images?.[0]?.url ? (
                        <motion.img
                          src={p.images[0].url}
                          alt={p.title}
                          loading="lazy"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6 }}
                          className="h-[320px] w-full object-cover"
                        />
                      ) : (
                        <div className="h-[320px] flex items-center justify-center bg-gray-200 dark:bg-[#111]">
                          <Image className="text-gray-400" />
                        </div>
                      )}
                    </Link>

                    <button
                      onClick={() => toggleLike(p._id)}
                      className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 p-2 rounded-full shadow"
                    >
                      <Heart
                        size={18}
                        className={
                          liked.includes(p._id)
                            ? "fill-red-600 text-red-600"
                            : "text-gray-500"
                        }
                      />
                    </button>
                  </div>

                  <div className="mt-6 px-2">
                    <h3 className="text-xl font-semibold">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.category?.name}
                    </p>

                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xl font-bold text-red-600">
                        ₹ {p.price}
                      </p>
                      <Link
                        to={`/products/${p._id}`}
                        className="font-semibold hover:text-red-600 transition"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}
