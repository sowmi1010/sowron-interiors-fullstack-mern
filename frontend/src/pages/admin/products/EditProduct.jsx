import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Package } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subCategory: "",
    price: "",
  });

  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔄 Load categories */
  const loadCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  /* 🔄 Load single product */
  const loadProduct = async () => {
    const res = await api.get(`/products/${id}`);
    const product = res.data;

    setForm({
      title: product.title,
      description: product.description || "",
      category: product.category?._id || "",
      subCategory: product.subCategory || "",
      price: product.price,
    });

    setExistingImages(product.images || []);
  };

  useEffect(() => {
    Promise.all([loadCategories(), loadProduct()])
      .catch(() => {
        toast.error("Failed to load product");
        navigate("/admin/products");
      })
      .finally(() => setLoading(false));

    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const selectedCategory = categories.find(
    (c) => c._id === form.category
  );

  /* 📸 New image preview (memory-safe) */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    preview.forEach((url) => URL.revokeObjectURL(url));

    setNewImages(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  /* 💾 Update product */
  const updateHandler = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("category", form.category);
      data.append("subCategory", form.subCategory);
      data.append("price", Number(form.price));

      newImages.forEach((img) => data.append("images", img));

      await api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-400 mt-20">
        Loading…
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-white">

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <Package /> Edit Product
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Update product details and images
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-black/60 backdrop-blur-xl
                      border border-white/10
                      rounded-2xl p-6 shadow-glass">
        <form onSubmit={updateHandler} className="space-y-4">

          {/* TITLE */}
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="Product title"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* DESCRIPTION */}
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows="3"
            placeholder="Description"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
                subCategory: "",
              })
            }
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* SUB CATEGORY */}
          {selectedCategory?.subCategories?.length > 0 && (
            <select
              value={form.subCategory}
              onChange={(e) =>
                setForm({ ...form, subCategory: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg
                         bg-white/5 border border-white/10
                         outline-none focus:border-brand-yellow transition"
            >
              <option value="">Select Sub Category</option>
              {selectedCategory.subCategories.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* PRICE */}
          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            placeholder="Price"
            className="w-full px-4 py-3 rounded-lg
                       bg-white/5 border border-white/10
                       outline-none focus:border-brand-yellow transition"
          />

          {/* EXISTING IMAGES */}
          {existingImages.length > 0 && (
            <>
              <p className="text-sm text-gray-400 mt-2">
                Existing Images
              </p>
              <div className="grid grid-cols-3 gap-3">
                {existingImages.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt="Product"
                    className="h-24 rounded-xl object-cover
                               border border-white/10"
                  />
                ))}
              </div>
            </>
          )}

          {/* NEW IMAGES */}
          <label className="block text-sm text-gray-400 mt-4">
            Replace Images
          </label>
          <input
            type="file"
            multiple
            onChange={handleImages}
            className="text-sm"
          />

          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Preview"
                  className="h-24 rounded-xl object-cover
                             border border-white/10"
                />
              ))}
            </div>
          )}

          {/* SAVE */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold
                       bg-brand-red text-white
                       hover:bg-brand-redDark
                       transition flex items-center justify-center gap-2"
          >
            <Save size={18} /> Update Product
          </button>

        </form>
      </div>
    </div>
  );
}
