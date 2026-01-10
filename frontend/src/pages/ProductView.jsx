import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Image } from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
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

    load();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <p className="py-32 text-center text-gray-400">
        Loading product…
      </p>
    );
  }

  if (!product) return null;

  const images = product.images || [];

  return (
    <>
      {/* ================= SEO ================= */}
      <SEO
        title={`${product.title} | Sowron Furniture Collection`}
        description={
          product.description ||
          "Premium modular furniture crafted with precision by Sowron Interiors."
        }
        keywords="modular furniture, interior furniture, premium furniture, Sowron Interiors"
      />

      <section className="min-h-screen bg-[#fafafa] dark:bg-[#0b0b0b]
                          text-gray-900 dark:text-gray-100">

        {/* ================= BACK ================= */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2
                       text-sm font-medium opacity-70
                       hover:text-red-600 transition"
          >
            <ArrowLeft size={16} /> Back to Products
          </button>
        </div>

        {/* ================= MAIN ================= */}
        <div className="max-w-7xl mx-auto px-6 py-20
                        grid lg:grid-cols-2 gap-16">

          {/* ================= IMAGE SHOWCASE ================= */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-[32px]
                         overflow-hidden shadow-2xl
                         bg-black cursor-zoom-in"
              onClick={() =>
                images[active]?.url && setPreview(images[active].url)
              }
            >
              {images[active]?.url ? (
                <motion.img
                  key={active}
                  src={images[active].url}
                  alt={product.title}
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-[420px] md:h-[520px] object-cover"
                />
              ) : (
                <div className="h-[420px] flex items-center justify-center">
                  <Image className="text-gray-400" size={40} />
                </div>
              )}

              <div className="absolute inset-0
                              bg-gradient-to-t
                              from-black/40 to-transparent" />
            </motion.div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="mt-6 flex gap-4 overflow-x-auto">
                {images.map((img, i) => (
                  <motion.img
                    key={i}
                    src={img.url}
                    alt={`${product.title} image ${i + 1}`}
                    loading="lazy"
                    onClick={() => setActive(i)}
                    whileHover={{ scale: 1.05 }}
                    className={`h-20 w-28 rounded-xl object-cover cursor-pointer
                      ${
                        active === i
                          ? "ring-4 ring-red-600"
                          : "opacity-70"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ================= DETAILS ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <span className="uppercase tracking-[0.25em] text-xs
                             text-red-600 font-semibold">
              {product.category?.name || "Premium Collection"}
            </span>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
              {product.title}
            </h1>

            <div className="mt-6 w-24 h-[3px]
                            bg-gradient-to-r
                            from-red-600 to-yellow-400
                            rounded-full" />

            <p className="mt-8 text-lg leading-relaxed
                          text-gray-700 dark:text-gray-300">
              {product.description ||
                "Designed with a balance of aesthetics, durability and modern craftsmanship — built to elevate your space."}
            </p>

            <div className="mt-10 flex items-end gap-4">
              <span className="text-sm uppercase opacity-60">
                Starting From
              </span>
              <p className="text-4xl font-black text-red-600">
                ₹ {product.price}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 flex gap-4">
              <button
                onClick={() => navigate("/book-demo")}
                className="
                  px-8 py-4 rounded-2xl font-semibold
                  bg-gradient-to-r from-red-600 to-yellow-400
                  text-white shadow-xl
                  hover:shadow-red-600/40
                  transition
                "
              >
                Book Free Consultation
              </button>

              <button
                onClick={() => navigate("/estimate")}
                className="
                  px-8 py-4 rounded-2xl font-semibold
                  border-2 border-red-600
                  text-red-600
                  hover:bg-red-600 hover:text-white
                  transition
                "
              >
                Get Estimate
              </button>
            </div>
          </motion.div>
        </div>

        {/* ================= LIGHTBOX ================= */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999]
                         bg-black/90 flex items-center
                         justify-center p-4"
              onClick={() => setPreview(null)}
            >
              <button
                className="absolute top-6 right-6
                           text-white bg-white/20
                           hover:bg-white/30
                           p-2 rounded-full"
              >
                <X size={22} />
              </button>

              <motion.img
                src={preview}
                alt={`${product.title} preview`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="max-h-[90vh] rounded-2xl shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
