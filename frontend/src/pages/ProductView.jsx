import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";

export default function ProductView() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [preview, setPreview] = useState(null);

  const load = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setP(res.data.find((x) => x._id === id));
  };

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
  }, []);

  if (!p) return <p className="p-10">Loading…</p>;

  return (
    <div className="min-h-screen px-6 md:px-20 pt-24 pb-32">

      <button
        onClick={() => history.back()}
        className="mb-6 flex gap-2 hover:text-orange-500"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* IMAGES */}
        <div>
          <motion.img
            src={p.images?.[0]?.url}
            onClick={() => setPreview(p.images[0].url)}
            className="rounded-xl w-full h-[400px] object-cover cursor-pointer"
          />

          {p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {p.images.slice(1).map((img, i) => (
                <img
                  key={i}
                  onClick={() => setPreview(img.url)}
                  src={img.url}
                  className="rounded-lg h-24 w-full object-cover cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <motion.div className="p-8 rounded-xl shadow-lg">
          <h2 className="text-4xl font-extrabold">{p.title}</h2>

          <p className="mt-2 text-sm">
            Category:{" "}
            <span className="font-semibold text-orange-500">
              {p.category?.name}
            </span>
          </p>

          <p className="mt-6">{p.description}</p>

          <p className="mt-8 text-4xl font-black text-orange-500">
            ₹ {p.price}
          </p>
        </motion.div>
      </div>

      {/* FULLSCREEN IMAGE */}
      <AnimatePresence>
        {preview && (
          <motion.div
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
