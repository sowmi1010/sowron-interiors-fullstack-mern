import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Image, Search } from "lucide-react";
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
  const [categories, setCategories] = useState([]);

  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");
  const [search, setSearch] = useState("");

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

  /* ================= LOAD PRODUCTS & CATEGORIES ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    load();
    window.scrollTo(0, 0);
  }, []);

  /* ================= LOAD WISHLIST ================= */
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const res = await api.get("/wishlist");
        setLiked(res.data.map((p) => p._id));
      } catch {}
    };

    loadWishlist();
  }, []);

  /* ================= FILTER ================= */
  const filteredProducts = products.filter((p) => {
    if (category !== "all" && p.category?.name !== category) return false;
    if (subCategory !== "all" && p.subCategory !== subCategory) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const activeCategory = categories.find((c) => c.name === category);
  const subCategories = activeCategory?.subCategories || [];

  /* ================= WISHLIST ================= */
  const toggleLike = async (id) => {
    try {
      if (liked.includes(id)) {
        await api.delete(`/wishlist/remove/${id}`);
        setLiked((prev) => prev.filter((x) => x !== id));
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/wishlist/add/${id}`);
        setLiked((prev) => [...prev, id]);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Please login to use wishlist");
    }
  };

  return (
    <>
      <SEO
        title="Premium Furniture Collection | Sowron Interiors"
        description="Explore premium modular furniture, wardrobes, kitchens and custom interior products by Sowron Interiors."
        keywords="furniture collection, modular furniture, interior products, Sowron Interiors"
      />

      <section className="min-h-screen bg-[#fafafa] dark:bg-[#0b0b0b] text-gray-900 dark:text-gray-100">

        {/* ================= HERO ================= */}
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

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
          >
            <span className="text-yellow-400 tracking-[0.3em] text-xs mb-5">
              SOWRON COLLECTION
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white">
              {text}
              <span className="border-r-2 border-yellow-400 ml-1 animate-pulse" />
            </h1>

            <p className="mt-6 max-w-xl text-gray-300">
              Discover furniture that blends aesthetics and craftsmanship.
            </p>
          </motion.div>
        </section>

        {/* ================= FILTER BAR ================= */}
        <section className="sticky top-20 z-20 bg-[#fafafa]/90 dark:bg-[#0b0b0b]/90 backdrop-blur border-b border-gray-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4">

            {/* SEARCH */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border outline-none"
              />
            </div>

            {/* CATEGORY */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory("all");
              }}
              className="p-3 rounded-xl bg-white dark:bg-[#161616] border outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* SUB CATEGORY */}
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              disabled={category === "all"}
              className="p-3 rounded-xl bg-white dark:bg-[#161616] border outline-none disabled:opacity-40"
            >
              <option value="all">All Sub Categories</option>
              {subCategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ================= PRODUCTS ================= */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          {loading ? (
            <p className="text-center text-gray-400 py-20">Loading collection…</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400 py-20">No products found</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-16">
              {filteredProducts.map((p, i) => (
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
                    <h3 className="text-xl font-semibold">{p.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.category?.name} • {p.subCategory}
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
