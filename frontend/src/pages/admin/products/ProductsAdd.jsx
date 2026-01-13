import { useEffect, useState } from "react";
import { PackagePlus, ImagePlus } from "lucide-react";
import { api } from "../../../lib/api";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

export default function ProductsAdd() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🔄 Load categories */
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  /* 📸 Image preview */
  const handleFilePreview = (e) => {
    const selected = Array.from(e.target.files);
    preview.forEach((url) => URL.revokeObjectURL(url));

    setFiles(selected);
    setPreview(selected.map((file) => URL.createObjectURL(file)));
  };

  /* ➕ Add product */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.price) {
      return toast.error("Title, Category & Price are required");
    }

    if (!files.length) {
      return toast.error("Please upload at least one image");
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("category", form.category);
      data.append("subCategory", subCategory);
      data.append("price", Number(form.price));
      files.forEach((file) => data.append("images", file));

      await api.post("/products/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Product upload failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === form.category);

  return (
    <div className="max-w-2xl mx-auto text-white">
      <Helmet>
        <title>Add Product</title>
      </Helmet>

      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-brand-red flex items-center justify-center gap-2">
          <PackagePlus /> Add Product
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Create a new product listing
        </p>
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={submitHandler}
        encType="multipart/form-data"
        className="bg-black/60 backdrop-blur-xl border border-white/10
                   rounded-2xl p-6 shadow-glass"
      >
        {/* TITLE */}
        <input
          placeholder="Product Name"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-3 mb-3 rounded-lg
                     bg-black border border-white/10
                     outline-none focus:border-brand-yellow transition"
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 mb-3 rounded-lg
                     bg-black border border-white/10
                     outline-none focus:border-brand-yellow transition"
        />

        {/* CATEGORY */}
        <select
          value={form.category}
          onChange={(e) => {
            setForm({ ...form, category: e.target.value });
            setSubCategory("");
          }}
          className="w-full px-4 py-3 mb-3 rounded-lg
           bg-black text-white border border-white/20
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
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-4 py-3 mb-3 rounded-lg
           bg-black text-white border border-white/20
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
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full px-4 py-3 mb-4 rounded-lg
                     bg-black border border-white/10
                     outline-none focus:border-brand-yellow transition"
        />

        {/* IMAGE UPLOAD */}
        <label className="block mb-3 text-sm text-gray-400">
          Product Images
        </label>

        <div
          className="border border-dashed border-white/20
                        rounded-xl p-4 mb-4 text-center
                        hover:border-brand-yellow transition"
        >
          <ImagePlus className="mx-auto mb-2 text-gray-400" />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilePreview}
            className="w-full text-sm"
          />
        </div>

        {/* PREVIEW */}
        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {preview.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Preview"
                className="h-24 rounded-xl object-cover border border-white/10"
              />
            ))}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold
                     bg-brand-red text-white
                     hover:bg-brand-redDark
                     transition disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
