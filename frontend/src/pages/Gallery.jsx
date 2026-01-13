import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Image as ImgIcon, Loader2 } from "lucide-react";
import SEO from "../components/SEO";

const PAGE_SIZE = 8;

export default function Gallery() {
  const [allItems, setAllItems] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [catRes, galleryRes] = await Promise.all([
          api.get("/categories"),
          api.get("/gallery"),
        ]);

        const galleryData = galleryRes.data || [];

        setCategories(catRes.data || []);
        setAllItems(galleryData);
        setVisibleItems(galleryData.slice(0, PAGE_SIZE));
      } catch {
        toast.error("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };

    load();
    window.scrollTo(0, 0);
  }, []);

  /* ================= FILTER ================= */
  const changeFilter = (slug) => {
    setFilter(slug);
    setPage(1);

    let filtered =
      slug === "all"
        ? allItems
        : allItems.filter(
            (item) =>
              item.category?.toLowerCase() === slug.toLowerCase()
          );

    setVisibleItems(filtered.slice(0, PAGE_SIZE));
  };

  /* ================= LOAD MORE ================= */
  const loadMore = () => {
    setLoadingMore(true);

    setTimeout(() => {
      const filtered =
        filter === "all"
          ? allItems
          : allItems.filter(
              (item) =>
                item.category?.toLowerCase() === filter.toLowerCase()
            );

      const nextPage = page + 1;
      const nextItems = filtered.slice(0, nextPage * PAGE_SIZE);

      setVisibleItems(nextItems);
      setPage(nextPage);
      setLoadingMore(false);
    }, 800); // spinner delay for UX
  };

  const filteredCount =
    filter === "all"
      ? allItems.length
      : allItems.filter(
          (item) =>
            item.category?.toLowerCase() === filter.toLowerCase()
        ).length;

  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title="Interior Design Gallery | Sowron Interiors Chennai"
        description="Explore premium interior design projects by Sowron Interiors — modular kitchens, wardrobes, turnkey interiors and custom furniture."
        keywords="interior design gallery, modular kitchen designs, turnkey interiors, Sowron Interiors"
      />

      <section className="min-h-screen mt-20 bg-white dark:bg-black text-brand-lightText dark:text-brand-darkText">
        {/* ================= HEADER ================= */}
        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-brand-red/10 blur-[220px]" />

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Our Works
          </motion.h1>

          <span className="block mx-auto mt-6 w-24 h-[3px] rounded-full bg-gradient-to-r from-brand-red to-brand-yellow" />

          <p className="mt-6 text-sm md:text-base opacity-70 max-w-xl mx-auto">
            A curated collection of our premium interior execution projects
          </p>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="flex flex-wrap gap-3 justify-center px-6 pb-16">
          <FilterButton
            active={filter === "all"}
            onClick={() => changeFilter("all")}
          >
            All Projects
          </FilterButton>

          {categories.map((cat) => (
            <FilterButton
              key={cat._id}
              active={filter === cat.slug}
              onClick={() => changeFilter(cat.slug)}
            >
              {cat.name}
            </FilterButton>
          ))}
        </div>

        {/* ================= GRID ================= */}
        {loading ? (
          <p className="text-center text-gray-400 py-24">
            Loading gallery…
          </p>
        ) : visibleItems.length === 0 ? (
          <p className="text-center text-gray-400 py-24">
            No gallery items found
          </p>
        ) : (
          <>
            <div
              className="
                max-w-[1600px] mx-auto px-6 pb-20
                grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                gap-10
              "
            >
              {visibleItems.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  whileHover={{ y: -10 }}
                  className="
                    group rounded-3xl overflow-hidden
                    bg-white dark:bg-[#121212]
                    border border-brand-yellow/30 dark:border-white/10
                    shadow-xl hover:shadow-brand-red/20
                    transition-all
                  "
                >
                  {/* IMAGE */}
                  <Link to={`/view-gallery/${item._id}`}>
                    {item.images?.[0]?.url ? (
                      <div className="relative overflow-hidden">
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          loading="lazy"
                          className="
                            h-[260px] w-full object-cover
                            transition-transform duration-700
                            group-hover:scale-110
                          "
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    ) : (
                      <div className="h-[260px] flex items-center justify-center bg-gray-200 dark:bg-[#0f0f0f]">
                        <ImgIcon className="text-gray-400" />
                      </div>
                    )}
                  </Link>

                  {/* CONTENT */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg truncate">
                      {item.title}
                    </h3>

                    <p className="text-xs uppercase tracking-widest opacity-60 mt-1">
                      {item.category
                        ? item.category.replace(/-/g, " ")
                        : "Uncategorized"}
                    </p>

                    <Link to={`/view-gallery/${item._id}`}>
                      <button
                        className="
                          mt-5 w-full py-3 rounded-xl
                          bg-brand-red text-white font-semibold
                          shadow-lg hover:shadow-brand-red/40
                          hover:scale-105 transition
                        "
                      >
                        View Project →
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ================= LOAD MORE ================= */}
            {visibleItems.length < filteredCount && (
              <div className="flex justify-center pb-28">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="
                    flex items-center gap-3 px-10 py-4 rounded-2xl
                    bg-brand-yellow text-black font-semibold
                    shadow-xl hover:shadow-brand-yellow/40
                    transition
                  "
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Projects"
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

/* ================= FILTER BUTTON ================= */
function FilterButton({ active, children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`
        px-6 py-2.5 rounded-full font-semibold text-sm
        transition-all
        ${
          active
            ? "bg-brand-red text-white shadow-lg"
            : "bg-white dark:bg-[#1b1b1b] hover:bg-brand-yellowSoft"
        }
      `}
    >
      {children}
    </motion.button>
  );
}
