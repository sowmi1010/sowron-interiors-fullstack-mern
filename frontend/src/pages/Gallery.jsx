import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Image as ImgIcon } from "lucide-react";
import { Helmet } from "react-helmet";

export default function Gallery() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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
        setItems(galleryData);
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

    if (slug === "all") {
      setItems(allItems);
    } else {
      setItems(
        allItems.filter(
          (item) =>
            item.category?.toLowerCase() === slug.toLowerCase()
        )
      );
    }
  };

  return (
    <>
      {/* ================= SEO ================= */}
      <Helmet>
        <title>Interior Design Gallery | Sowron Interiors Chennai</title>
        <meta
          name="description"
          content="Explore premium interior design projects by Sowron Interiors — modular kitchens, wardrobes, turnkey interiors and custom furniture."
        />
        <meta
          name="keywords"
          content="interior design gallery, modular kitchen designs, turnkey interiors, Sowron Interiors"
        />
      </Helmet>

      <section
        className="
          min-h-screen mt-24
          bg-gradient-to-b from-white via-white to-yellow-50/40
          dark:from-[#050505] dark:via-[#0b0b0b] dark:to-black
          text-gray-900 dark:text-gray-100
        "
      >
        {/* ================= HEADER ================= */}
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold"
          >
            Our Works
            <span className="block mx-auto mt-4 w-24 h-[3px] rounded-full
              bg-gradient-to-r from-red-600 to-yellow-400" />
          </motion.h1>

          <p className="mt-4 text-sm md:text-base opacity-70">
            A curated collection of our premium interior execution projects
          </p>
        </div>

        {/* ================= FILTER TABS ================= */}
        <div className="flex flex-wrap gap-3 justify-center px-6 pb-12">
          <FilterButton
            active={filter === "all"}
            onClick={() => changeFilter("all")}
          >
            All
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
        ) : items.length === 0 ? (
          <p className="text-center text-gray-400 py-24">
            No gallery items found
          </p>
        ) : (
          <div
            className="
              max-w-[1600px] mx-auto px-6 pb-24
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
              gap-10
            "
          >
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="
                  group rounded-3xl overflow-hidden
                  bg-white dark:bg-[#141414]
                  border border-red-200/40 dark:border-white/10
                  shadow-xl hover:shadow-red-600/20
                  transition-all
                "
              >
                <Link to={`/view-gallery/${item._id}`}>
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="
                        h-[260px] w-full object-cover
                        transition-transform duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="h-[260px] flex items-center justify-center
                                    bg-gray-200 dark:bg-[#0f0f0f]">
                      <ImgIcon className="text-gray-400" />
                    </div>
                  )}
                </Link>

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
                        mt-4 w-full py-3 rounded-xl
                        bg-gradient-to-r from-red-600 to-red-700
                        text-white font-semibold
                        hover:shadow-red-600/40
                        transition-all
                      "
                    >
                      View Project →
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ================= FILTER BUTTON ================= */
function FilterButton({ active, children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-5 py-2 rounded-full font-semibold text-sm
        transition-all
        ${
          active
            ? "bg-gradient-to-r from-red-600 to-yellow-400 text-black shadow-md"
            : "bg-white dark:bg-[#1b1b1b] hover:bg-red-50 dark:hover:bg-[#222]"
        }
      `}
    >
      {children}
    </motion.button>
  );
}
