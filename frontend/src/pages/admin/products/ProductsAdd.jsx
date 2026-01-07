import { useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
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

  /* 📸 Image preview (FIXED MEMORY LEAK) */
  const handleFilePreview = (e) => {
    const selected = Array.from(e.target.files);

    // revoke old previews
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

      files.forEach((file) => {
        data.append("images", file); // MUST match backend field
      });

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

  const selectedCategory = categories.find(
    (c) => c._id === form.category
  );

  return (
    <div className="p-6 text-white">
      <Helmet>
        <title>Add Product</title>
      </Helmet>

      <h2 className="text-3xl font-bold text-[#ff6b00] mb-8 flex justify-center gap-2">
        <PackagePlus /> Add Product
      </h2>

      <form
        onSubmit={submitHandler}
        encType="multipart/form-data"
        className="bg-[#141414] border border-[#222] p-6 rounded-xl max-w-xl mx-auto"
      >
        <input
          placeholder="Product Name"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full p-3 mb-3 bg-[#1b1b1b] rounded"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full p-3 mb-3 bg-[#1b1b1b] rounded"
        />

        {/* CATEGORY */}
        <select
          value={form.category}
          onChange={(e) => {
            setForm({ ...form, category: e.target.value });
            setSubCategory("");
          }}
          className="w-full p-3 mb-3 bg-[#1b1b1b] rounded"
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
            className="w-full p-3 mb-3 bg-[#1b1b1b] rounded"
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
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: e.target.value })
          }
          className="w-full p-3 mb-3 bg-[#1b1b1b] rounded"
        />

        {/* IMAGES */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFilePreview}
          className="w-full mb-3"
        />

        {preview.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {preview.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Preview"
                className="h-20 rounded object-cover"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff6b00] text-black py-3 rounded font-semibold"
        >
          {loading ? "Uploading..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
