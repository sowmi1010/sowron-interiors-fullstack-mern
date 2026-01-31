import mongoose from "mongoose";

/* 🔑 SLUG GENERATOR */
const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    subCategories: {
      type: [String],
      default: [],
    },

    icon: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* AUTO SLUG */
categorySchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  let slug = createSlug(this.name);

  const exists = await mongoose.models.Category.findOne({
    slug,
    _id: { $ne: this._id },
  });

  if (exists) slug = `${slug}-${Date.now()}`;

  this.slug = slug;
});

export default mongoose.model("Category", categorySchema);
