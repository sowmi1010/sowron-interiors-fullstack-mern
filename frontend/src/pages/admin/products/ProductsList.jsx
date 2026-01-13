import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useSearch } from "../../../context/SearchContext";
import { Edit3, Trash2, Package, Image, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Pagination from "../../../components/ui/Pagination";

const LIMIT = 6;

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { debouncedQuery } = useSearch();
  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/products/admin?page=${page}&limit=${LIMIT}&q=${debouncedQuery}`
      );

      setProducts(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, debouncedQuery]);

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [debouncedQuery]);

  useEffect(() => {
    if (!selected && products.length > 0) {
      setSelected(products[0]);
    }
  }, [products, selected]);

  /* ================= DELETE ================= */
  const removeProduct = async (id) => {
    if (deleting) return;
    if (!window.confirm("Delete this product permanently?")) return;

    try {
      setDeleting(true);
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      setSelected(null);
      loadProducts();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-[88vh] overflow-hidden text-white">

      {/* ================= LEFT PANEL ================= */}
      <div className="w-[34%] bg-black/60 backdrop-blur-xl
                      border-r border-white/10 flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-brand-red">
            Products
          </h2>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="flex items-center gap-1
                       bg-brand-red text-white px-3 py-1.5
                       rounded-lg font-semibold hover:bg-brand-redDark transition"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center mt-10">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No products found
            </p>
          ) : (
            products.map((p) => (
              <motion.div
                key={p._id}
                onClick={() => setSelected(p)}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className={`cursor-pointer px-4 py-3 border-b border-white/5
                ${selected?._id === p._id ? "bg-white/10" : ""}`}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden
                                  flex items-center justify-center">
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {p.category?.name || "Uncategorized"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        <Pagination
          page={page}
          total={total}
          limit={LIMIT}
          onChange={setPage}
        />
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex-1 p-8 overflow-y-auto bg-brand-darkBg">
        {!selected ? (
          <p className="text-gray-500 text-center mt-20">
            Select a product
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-semibold text-brand-red mb-2">
              {selected.title}
            </h2>

            <span className="inline-block text-xs
                             bg-white/5 border border-white/10
                             px-3 py-1 rounded-full">
              {selected.category?.name}
            </span>

            <p className="text-xl mt-4 text-brand-yellow font-semibold">
              ₹ {selected.price}
            </p>

            <p className="text-gray-300 mt-4">
              {selected.description || "No description"}
            </p>

            {/* IMAGES */}
            <h3 className="mt-6 mb-2 text-sm text-gray-400">
              Images
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selected.images?.length > 0 ? (
                selected.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`${selected.title} ${i + 1}`}
                    className="rounded-xl object-cover h-32 w-full"
                  />
                ))
              ) : (
                <div className="text-gray-500 flex gap-2">
                  <Image size={16} /> No images
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() =>
                  navigate(`/admin/product/edit/${selected._id}`)
                }
                className="flex items-center gap-2
                           bg-white/10 hover:bg-white/20
                           px-4 py-2 rounded-lg transition"
              >
                <Edit3 size={16} /> Edit
              </button>

              <button
                disabled={deleting}
                onClick={() => removeProduct(selected._id)}
                className="flex items-center gap-2
                           bg-red-600 hover:bg-red-700
                           px-4 py-2 rounded-lg
                           disabled:opacity-60 transition"
              >
                <Trash2 size={16} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
