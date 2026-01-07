import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useSearch } from "../../../context/SearchContext";
import { Edit3, Trash2, Package, Image } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { query = "" } = useSearch();
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data);

      if (selected) {
        const stillExists = res.data.find(
          (p) => p._id === selected._id
        );
        setSelected(stillExists || null);
      } else if (res.data.length > 0) {
        setSelected(res.data[0]);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

  /* 🔍 SAFE SEARCH */
  const filtered = products.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-[88vh] overflow-hidden bg-[#0e0e0e] text-white">

      {/* LEFT PANEL */}
      <div className="w-[32%] bg-[#111] border-r border-[#222] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[#1d1d1d]">
          <h2 className="text-xl font-bold text-[#ff6b00]">
            Products
          </h2>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="bg-[#ff6b00] text-black px-3 py-1 rounded-lg font-semibold"
          >
            + Add
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center mt-10">
            Loading...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No products found
          </p>
        ) : (
          filtered.map((p) => (
            <motion.div
              key={p._id}
              onClick={() => setSelected(p)}
              whileHover={{ backgroundColor: "#1a1a1a" }}
              className={`cursor-pointer px-4 py-3 border-b border-[#1b1b1b]
                ${selected?._id === p._id ? "bg-[#1a1a1a]" : ""}`}
            >
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-[#222] rounded overflow-hidden flex items-center justify-center">
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

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!selected ? (
          <p className="text-gray-500 text-center mt-20">
            Select a product
          </p>
        ) : (
          <motion.div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#ff6b00] mb-2">
              {selected.title}
            </h2>

            <span className="inline-block text-xs bg-[#222] px-3 py-1 rounded">
              {selected.category?.name}
            </span>

            <p className="text-xl mt-3 text-[#ff6b00] font-semibold">
              ₹ {selected.price}
            </p>

            <p className="text-gray-300 mt-4">
              {selected.description || "No description"}
            </p>

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
                    className="rounded-lg object-cover h-32 w-full"
                  />
                ))
              ) : (
                <div className="text-gray-500 flex gap-2">
                  <Image size={16} /> No images
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() =>
                  navigate(`/admin/product/edit/${selected._id}`)
                }
                className="bg-blue-600 px-4 py-2 rounded flex gap-2"
              >
                <Edit3 size={16} /> Edit
              </button>

              <button
                disabled={deleting}
                onClick={() => removeProduct(selected._id)}
                className="bg-red-600 px-4 py-2 rounded flex gap-2 disabled:opacity-60"
              >
                <Trash2 size={16} />{" "}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
