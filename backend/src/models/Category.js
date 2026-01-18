import mongoose from "mongoose";

/* 🔑 SLUG GENERATOR */
const createSlug = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    // 🔥 REQUIRED FOR PRODUCT FORM
    subCategories: {
      type: [String],
      default: [],
    },

    icon: String, // optional
  },
  { timestamps: true }
);

/* AUTO SLUG */
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = createSlug(this.name);
  next();
});

export default mongoose.model("Category", categorySchema);
