import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Image } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔄 Load SINGLE product */
  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch {
      toast.error("Product not found");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading…
      </p>
    );
  }

  if (!product) return null;

  const images = product.images || [];

  return (
    <div className="min-h-screen px-6 md:px-20 pt-24 pb-32">

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex gap-2 hover:text-orange-500"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">

        {/* IMAGES */}
        <div>
          {images[0]?.url ? (
            <motion.img
              src={images[0].url}
              alt={product.title}
              onClick={() => setPreview(images[0].url)}
              className="rounded-xl w-full h-[400px] object-cover cursor-pointer"
            />
          ) : (
            <div className="h-[400px] bg-gray-200 dark:bg-[#111]
                            flex items-center justify-center rounded-xl">
              <Image className="text-gray-400" size={40} />
            </div>
          )}

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.slice(1).map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`${product.title} ${i + 2}`}
                  onClick={() => setPreview(img.url)}
                  className="rounded-lg h-24 w-full object-cover cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <motion.div className="p-8 rounded-xl shadow-lg bg-white/60 dark:bg-[#111]/60">
          <h2 className="text-4xl font-extrabold">
            {product.title}
          </h2>

          <p className="mt-2 text-sm">
            Category:{" "}
            <span className="font-semibold text-orange-500">
              {product.category?.name || "Uncategorized"}
            </span>
          </p>

          <p className="mt-6">
            {product.description || "No description"}
          </p>

          <p className="mt-8 text-4xl font-black text-orange-500">
            ₹ {product.price}
          </p>
        </motion.div>
      </div>

      {/* FULLSCREEN IMAGE */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999]"
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-6 right-6 text-white"
            >
              <X size={22} />
            </button>

            <motion.img
              src={preview}
              className="max-h-[85vh] rounded-xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
