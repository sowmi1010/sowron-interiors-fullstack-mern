import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Image as ImgIcon,
  Search,
  Loader2,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import SEO from "../components/SEO";

const PAGE_SIZE = 8;

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");

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

  /* ================= SUBCATEGORIES ================= */
  const subCategories = useMemo(() => {
    if (category === "all") return [];
    const c = categories.find((c) => c.slug === category);
    return c?.subCategories || [];
  }, [category, categories]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        category === "all" || item.category?.slug === category;

      const matchSub =
        subCategory === "all" || item.subCategory === subCategory;

      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.name?.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSub && matchSearch;
    });
  }, [items, category, subCategory, search]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 400);
  };

  return (
    <>
      <SEO title="Gallery | Sowron Interiors" />

      <section className="relative min-h-screen mt-20 overflow-hidden">

        {/* ===== PREMIUM ANIMATED BACKGROUND ===== */}
        <motion.div
          className="absolute -inset-[30%] -z-10 rounded-full blur-3xl
            bg-gradient-to-tr from-red-500/20 via-pink-400/20 to-red-700/20
            dark:from-red-900/20 dark:via-red-800/10 dark:to-black"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

        <div className="absolute inset-0 -z-10
          bg-gradient-to-b from-white via-white to-[#fff5f5]
          dark:from-[#0b0b0b] dark:via-[#111] dark:to-[#0b0b0b]" />

        {/* ===== HEADER ===== */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-14 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold
              bg-gradient-to-r from-red-600 via-red-700 to-red-900
              bg-clip-text text-transparent"
          >
            Our Signature Works
          </motion.h1>

          <p className="mt-4 text-sm md:text-base
            text-gray-600 dark:text-gray-400">
            Bespoke interiors crafted with timeless elegance
          </p>
        </div>

        {/* ===== FILTER BAR (PREMIUM DROPDOWN) ===== */}
    <div className="max-w-5xl mx-auto px-6 mb-16">
  <div
    className="grid grid-cols-1 md:grid-cols-3 gap-6
      bg-white/70 dark:bg-[#141414]/70
      backdrop-blur-2xl
      border border-black/5 dark:border-white/10
      rounded-3xl px-6 py-6
      shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
  >
    {/* SEARCH */}
    <div className="relative">
      <label className="block text-[11px] tracking-widest uppercase mb-2
        text-gray-500 dark:text-gray-400">
        Search
      </label>

      <Search className="absolute text-black  dark:text-white left-4 top-[65%] -translate-y-1/2 opacity-40" />
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search projects"
        className="w-full pl-12 pr-4 py-3 rounded-2xl
          bg-white text-black dark:text-white dark:bg-[#1a1a1a]
          border border-black/10 dark:border-white/10
          text-sm
          outline-none
          focus:border-red-500/40
          focus:ring-2 focus:ring-red-500/10
          transition"
      />
    </div>

    {/* CATEGORY */}
    <PremiumSelect
      label="Category"
      value={category}
      onChange={(v) => {
        setCategory(v);
        setSubCategory("all");
        setPage(1);
      }}
      options={[
        { label: "All Categories", value: "all" },
        ...categories.map((c) => ({
          label: c.name,
          value: c.slug,
        })),
      ]}
    />

    {/* SUB CATEGORY */}
    <PremiumSelect
      label="Sub Category"
      value={subCategory}
      disabled={subCategories.length === 0}
      onChange={(v) => {
        setSubCategory(v);
        setPage(1);
      }}
      options={[
        { label: "All Sub Categories", value: "all" },
        ...subCategories.map((sc) => ({
          label: sc,
          value: sc,
        })),
      ]}
    />
  </div>
</div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="animate-spin text-red-600" size={36} />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            reset={() => {
              setCategory("all");
              setSubCategory("all");
              setSearch("");
              setPage(1);
            }}
          />
        ) : (
          <>
            {/* ===== GRID ===== */}
            <div className="max-w-[1400px] mx-auto px-6 pb-20
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((item, i) => (
                <GalleryCard key={item._id} item={item} index={i} />
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

/* ================= PREMIUM UI ================= */

function Dropdown({ label, value, options, onChange, disabled }) {
  return (
    <div className="relative">
      <label className="text-xs uppercase tracking-wider
        text-gray-500 dark:text-gray-400 mb-1 block">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-xl appearance-none
          bg-transparent border border-black/10 dark:border-white/10
          outline-none focus:ring-2 focus:ring-red-600/30
          disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-4 top-[55%] opacity-40 pointer-events-none"
      />
    </div>
  );
}

function GalleryCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="relative rounded-3xl overflow-hidden
        bg-white dark:bg-[#121212]
        shadow-xl hover:shadow-red-900/30 transition"
    >
      <Link to={`/view-gallery/${item._id}`} className="block relative">
        {item.images?.[0]?.url ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            draggable={false}
            className="h-[260px] w-full object-cover
              hover:scale-110 transition-transform duration-700
              pointer-events-none select-none"
          />
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <ImgIcon className="opacity-30" />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none
          bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h3 className="text-white font-semibold truncate">
            {item.title}
          </h3>
          <p className="text-xs uppercase tracking-widest text-white/70 mt-1">
            {item.category?.name}
            {item.subCategory && ` • ${item.subCategory}`}
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
  );
}

function EmptyState({ reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <ImgIcon className="text-red-600" />
      </div>
      <h3 className="text-lg font-semibold">No gallery items found</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        We don’t have projects under this selection yet.
      </p>
      <button
        onClick={reset}
        className="mt-6 text-sm font-semibold text-red-600 hover:underline"
      >
        View all projects →
      </button>
    </div>
  );
}

function PremiumSelect({ label, value, options, onChange, disabled }) {
  return (
    <div className="relative">
      <label className="block text-[11px] tracking-widest uppercase mb-2
        text-gray-500 dark:text-gray-400">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-3 rounded-2xl
          bg-white text-black dark:text-white dark:bg-[#1a1a1a]
          border border-black/10 dark:border-white/10
          text-sm
          outline-none
          focus:border-red-500/40
          focus:ring-2 focus:ring-red-500/10
          disabled:opacity-50
          transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* ARROW */}
      <svg
        className="absolute right-4 top-[60%] -translate-y-1/2
          w-4 h-4 opacity-40 pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}