import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Image as ImgIcon,
  Search,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import SEO from "../components/SEO";

const PAGE_SIZE = 8;

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [catRes, galRes] = await Promise.all([
          api.get("/categories"),
          api.get("/gallery"),
        ]);
        setCategories(catRes.data || []);
        setItems(galRes.data || []);
      } catch {
        toast.error("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ================= FILTER + SEARCH ================= */
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        filter === "all" || item.category?.slug === filter;

      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [items, filter, search]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 500);
  };

  return (
    <>
      <SEO title="Gallery | Sowron Interiors" />

      <section className="relative min-h-screen mt-20 text-black dark:text-white">

        {/* ===== PREMIUM BACKGROUND ===== */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br 
          from-[#fff5f5] via-[#ffffff] to-[#fff0f0]
          dark:from-[#0b0b0b] dark:via-[#111111] dark:to-[#0b0b0b]" />

        <div className="absolute inset-0 -z-10 opacity-[0.03]
          bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)]
          [background-size:28px_28px]" />

        {/* ===== HEADER ===== */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold
              bg-gradient-to-r from-red-600 via-red-700 to-red-900
              bg-clip-text text-transparent"
          >
            Our Signature Works
          </motion.h1>

          <p className="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
            Premium interiors crafted with timeless elegance
          </p>
        </div>

        {/* ===== SEARCH & FILTER ===== */}
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search projects"
              className="w-full pl-12 p-4 rounded-xl
                bg-white dark:bg-[#121212]
                border border-red-500/30
                focus:border-red-600 focus:ring-2 focus:ring-red-600/20
                outline-none transition"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="w-full p-4 rounded-xl
              bg-white dark:bg-[#121212]
              border border-red-500/30
              focus:border-red-600 focus:ring-2 focus:ring-red-600/20
              outline-none transition"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-red-600" size={34} />
          </div>
        ) : visible.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <ImgIcon className="text-red-600" />
            </div>

            <h3 className="text-lg font-semibold">
              No gallery items found
            </h3>

            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              We don’t have projects under this category yet.
              Please explore other categories.
            </p>

            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
                setPage(1);
              }}
              className="mt-6 text-sm font-semibold text-red-600 hover:underline"
            >
              View all projects →
            </button>
          </div>
        ) : (
          <>
            {/* ===== GRID ===== */}
            <div className="max-w-[1400px] mx-auto px-6 pb-20
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="relative rounded-3xl overflow-hidden
                    bg-white dark:bg-[#121212]
                    shadow-xl hover:shadow-red-900/30 transition"
                >
                  <Link
                    to={`/view-gallery/${item._id}`}
                    className="block relative"
                  >
                    {/* IMAGE */}
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="h-[260px] w-full object-cover
                          hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="h-[260px] flex items-center justify-center">
                        <ImgIcon className="opacity-30" />
                      </div>
                    )}

                    {/* OVERLAY */}
                    <div className="absolute inset-0 pointer-events-none
                      bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* BOTTOM CONTENT */}
                    <div className="absolute bottom-0 left-0 right-0 p-5
                      pointer-events-none">
                      <h3 className="text-white font-semibold text-base truncate">
                        {item.title}
                      </h3>

                      <p className="text-xs uppercase tracking-widest text-white/70 mt-1">
                        {item.category?.name}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span className="h-[2px] w-10 bg-red-600" />
                        <span className="inline-flex items-center gap-1
                          text-xs font-semibold text-white
                          bg-red-600 px-3 py-1.5 rounded-full">
                          View <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* LOAD MORE */}
            {hasMore && (
              <div className="flex justify-center pb-28">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-14 py-4 rounded-full font-semibold
                    bg-gradient-to-r from-red-600 to-red-900
                    text-white shadow-xl hover:shadow-red-900/50 transition"
                >
                  {loadingMore ? "Loading…" : "Explore More"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
