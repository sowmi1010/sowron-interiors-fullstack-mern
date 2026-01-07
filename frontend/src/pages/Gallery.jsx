import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Image as ImgIcon } from "lucide-react";

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
    <div className="bg-[#efefef] dark:bg-[#050505] min-h-screen mt-24">

      {/* ================= FILTER TABS ================= */}
      <div className="flex flex-wrap gap-3 justify-center py-10 px-4">
        <motion.button
          onClick={() => changeFilter("all")}
          className={`px-5 py-2 rounded-full font-semibold transition ${
            filter === "all"
              ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black"
              : "bg-white dark:bg-[#1b1b1b]"
          }`}
        >
          All
        </motion.button>

        {categories.map((cat) => (
          <motion.button
            key={cat._id}
            onClick={() => changeFilter(cat.slug)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              filter === cat.slug
                ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-black"
                : "bg-white dark:bg-[#1b1b1b]"
            }`}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* ================= GALLERY GRID ================= */}
      {loading ? (
        <p className="text-center text-gray-400 py-20">
          Loading gallery…
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          No gallery items found
        </p>
      ) : (
        <div className="px-4 md:px-20 pb-20 grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
          {items.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ scale: 1.03 }}
              className="rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-[#1a1a1a]"
            >
              <Link to={`/view-gallery/${item._id}`}>
                {item.images?.[0]?.url ? (
                  <img
                    src={item.images[0].url}
                    className="h-[270px] w-full object-cover"
                    alt={item.title}
                  />
                ) : (
                  <div className="h-[270px] flex items-center justify-center bg-gray-200 dark:bg-[#111]">
                    <ImgIcon className="text-gray-400" />
                  </div>
                )}
              </Link>

              <div className="p-5">
                <h3 className="font-bold text-xl truncate">
                  {item.title}
                </h3>

                <p className="text-xs uppercase tracking-widest opacity-70">
                  {item.category
                    ? item.category.replace(/-/g, " ")
                    : "Uncategorized"}
                </p>

                <Link to={`/view-gallery/${item._id}`}>
                  <button className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-semibold">
                    View All →
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
