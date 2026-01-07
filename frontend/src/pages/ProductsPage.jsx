import { useEffect, useState } from "react";
import { api } from "../../lib/api"; // ✅ use shared api
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Heart, Image } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔄 Load products */
  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setData(res.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, []);

  /* 🔥 AUTO categories from backend */
  const categories = [
    "all",
    ...new Set(
      data
        .map((p) => p.category?.name)
        .filter(Boolean)
    ),
  ];

  /* 🔥 AUTO filtering */
  const filtered =
    filter === "all"
      ? data
      : data.filter(
          (p) =>
            p.category?.name
              ?.toLowerCase() === filter.toLowerCase()
        );

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#050505] text-gray-800 dark:text-gray-200">

      {/* HERO */}
      <section className="relative h-[330px] md:h-[400px] w-full overflow-hidden rounded-b-[40px] shadow-lg">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/v3.mp4"
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center text-center"
        >
          <h2 className="text-white font-extrabold text-4xl md:text-6xl">
            Premium Furniture
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-300 text-transparent bg-clip-text">
              Collection
            </span>
          </h2>
        </motion.div>
      </section>

      {/* FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center gap-3 py-10 px-4"
      >
        <span className="text-sm flex items-center gap-2 opacity-80">
          <Filter size={16} /> Category:
        </span>

        {categories.map((c) => (
          <motion.button
            key={c}
            whileHover={{ scale: 1.08 }}
            onClick={() => setFilter(c)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              ${
                filter === c
                  ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black"
                  : "bg-white/30 dark:bg-black/30 border"
              }`}
          >
            {c.toUpperCase()}
          </motion.button>
        ))}
      </motion.div>

      {/* GRID */}
      {loading ? (
        <p className="text-center py-20 text-gray-400">
          Loading products…
        </p>
      ) : (
        <div className="px-4 md:px-20 pb-24 grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
          {filtered.map((p, index) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className="group rounded-3xl overflow-hidden bg-white/35 dark:bg-[#1a1a1a]/40 backdrop-blur-xl border shadow-lg"
            >
              <div className="relative">
                <Link to={`/products/${p._id}`}>
                  {p.images?.[0]?.url ? (
                    <motion.img
                      src={p.images[0].url}
                      alt={p.title}
                      whileHover={{ scale: 1.15 }}
                      className="object-cover w-full h-[270px]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[270px] bg-gray-200 dark:bg-[#111]">
                      <Image className="text-gray-400" />
                    </div>
                  )}
                </Link>

                <button
                  onClick={() => toggleLike(p._id)}
                  className="absolute top-3 left-3 bg-white/20 px-2 py-1 rounded-full"
                >
                  <Heart
                    size={18}
                    className={
                      liked.includes(p._id)
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }
                  />
                </button>

                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {p.category?.name}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-xl truncate">
                  {p.title}
                </h3>
                <p className="text-sm line-clamp-2">
                  {p.description || "No description"}
                </p>
                <p className="mt-3 font-bold text-xl text-orange-500">
                  ₹ {p.price}
                </p>

                <Link to={`/products/${p._id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold"
                  >
                    View Details →
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center py-20 text-gray-400">
          No products found…
        </p>
      )}
    </div>
  );
}
