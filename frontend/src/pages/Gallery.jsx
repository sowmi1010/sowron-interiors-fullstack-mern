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
import SecureImageCanvas from "../components/ui/SecureImageCanvas.jsx";

const PAGE_SIZE = 8;

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isBlurred, setIsBlurred] = useState(false);

  const [category, setCategory] = useState("all");
  const [subCategory, setSubCategory] = useState("all");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const watermark = "enquiry@sowron.com";

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data || []);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================= GALLERY (SERVER PAGED) ================= */
  useEffect(() => {
    let active = true;

    const load = async () => {
      const append = page > 1;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };
        if (debouncedSearch) params.q = debouncedSearch;
        if (category !== "all") params.categorySlug = category;
        if (subCategory !== "all") params.subCategory = subCategory;

        const res = await api.get("/gallery", { params });
        const payload = res.data || {};
        const serverItems = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        const serverTotal =
          typeof payload.total === "number"
            ? payload.total
            : serverItems.length;

        if (!active) return;

        setItems((prev) => (append ? [...prev, ...serverItems] : serverItems));
        setTotal(serverTotal);
      } catch {
        if (!active) return;
        if (!append) {
          setItems([]);
          setTotal(0);
        }
        toast.error("Failed to load gallery");
      } finally {
        if (!active) return;
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [page, category, subCategory, debouncedSearch]);

  useEffect(() => {
    const onBlur = () => setIsBlurred(true);
    const onFocus = () => setIsBlurred(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    const onKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["U", "S", "P"].includes(e.key))
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  /* ================= SUBCATEGORIES ================= */
  const subCategories = useMemo(() => {
    if (category === "all") return [];
    const c = categories.find((c) => c.slug === category);
    return c?.subCategories || [];
  }, [category, categories]);

  const hasMore = items.length < total;

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setPage((p) => p + 1);
  };

  return (
    <>
      <SEO title="Gallery | Sowron Interiors" />

      <section
        className="relative min-h-screen mt-20 overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        {isBlurred && (
          <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md
            flex items-center justify-center text-white text-sm">
            Screen hidden for security
          </div>
        )}

        {/* ===== PREMIUM ANIMATED BACKGROUND ===== */}
        <motion.div
          className="absolute -inset-[30%] -z-10 rounded-full blur-3xl
            bg-[conic-gradient(at_top,rgba(255,60,60,0.18),rgba(255,210,80,0.12),rgba(255,60,60,0.18))]
            dark:bg-[conic-gradient(at_top,rgba(255,90,90,0.12),rgba(255,210,80,0.08),rgba(255,90,90,0.12))]"
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        />

        <div className="absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,245,245,0.9),rgba(255,255,255,0.95))]
          dark:bg-[radial-gradient(circle_at_top,rgba(20,20,20,0.9),rgba(10,10,10,0.95),rgba(0,0,0,0.98))]" />

        {/* ===== HEADER ===== */}
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-extrabold tracking-tight
                  bg-gradient-to-r from-red-600 via-red-700 to-red-900
                  bg-clip-text text-transparent"
              >
                Our Signature Works
              </motion.h1>

              <p className="mt-3 text-sm md:text-base text-gray-600 dark:text-gray-400">
                Bespoke interiors crafted with timeless elegance
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <Link
                to="/commercial"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  text-sm font-semibold text-white
                  bg-gradient-to-r from-brand-red to-brand-redDark
                  hover:shadow-[0_16px_30px_rgba(211,47,47,0.35)] transition"
              >
                Commercial Services
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* ===== FILTER BAR (PREMIUM DROPDOWN) ===== */}
    <div className="max-w-5xl mx-auto px-6 mb-16">
  <div
    className="grid grid-cols-1 md:grid-cols-3 gap-6
      bg-white/80 dark:bg-[#141414]/80
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
        ) : items.length === 0 ? (
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
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {items.map((item, i) => (
                <GalleryCard
                  key={item._id}
                  item={item}
                  index={i}
                  watermark={watermark}
                />
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

function GalleryCard({ item, index, watermark }) {
  const coverSrc =
    item.images?.[0]?.thumbUrl ||
    item.images?.[0]?.mediumUrl ||
    item.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      className="relative rounded-3xl overflow-hidden
        bg-white dark:bg-[#121212]
        shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        hover:shadow-[0_25px_80px_rgba(200,20,20,0.25)]
        transition"
    >
      <Link to={`/view-gallery/${item._id}`} className="block relative">
        {coverSrc ? (
          <SecureImageCanvas
            src={coverSrc}
            alt={item.title}
            watermark={watermark}
            maxDimension={900}
            className="h-[260px] w-full
              hover:scale-105 transition-transform duration-700
              pointer-events-none select-none"
            rounded={false}
          />
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <ImgIcon className="opacity-30" />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none
          bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <h3 className="text-white font-semibold truncate text-lg">
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
