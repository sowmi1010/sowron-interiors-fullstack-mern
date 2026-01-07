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

  /* 🔄 Load SINGLE product (FIXED) */
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

  /* 📸 New image preview (MEMORY SAFE) */
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
    <div className="flex justify-center">
      <div className="max-w-2xl w-full bg-[#141414] border border-[#1f1f1f] rounded-xl p-8 text-white">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <Package size={26} className="text-[#ff6b00]" />
          <h2 className="text-2xl font-bold text-[#ff6b00]">
            Edit Product
          </h2>
        </div>

        <form onSubmit={updateHandler} className="space-y-4">

          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="Title"
            className="w-full bg-[#1a1a1a] p-3 rounded"
          />

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows="3"
            placeholder="Description"
            className="w-full bg-[#1a1a1a] p-3 rounded"
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
            className="w-full bg-[#1a1a1a] p-3 rounded"
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
              className="w-full bg-[#1a1a1a] p-3 rounded"
            >
              <option value="">Select Sub Category</option>
              {selectedCategory.subCategories.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            placeholder="Price"
            className="w-full bg-[#1a1a1a] p-3 rounded"
          />

          {/* EXISTING IMAGES */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt="Product"
                  className="h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}

          {/* NEW IMAGES */}
          <label className="block text-sm text-gray-400 mt-3">
            Replace Images
          </label>
          <input type="file" multiple onChange={handleImages} />

          {preview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {preview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="h-24 rounded object-cover"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#ff6b00] py-3 rounded font-semibold
                       flex items-center justify-center gap-2"
          >
            <Save size={18} /> Update Product
          </button>

        </form>
      </div>
    </div>
  );
}
