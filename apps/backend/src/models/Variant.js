import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: [/^VAR\d{3}$/, "Variant ID must be in format VARXXX"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    addPercentageInBasePrice: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
    media: {
      images: [
        {
          type: String,
          trim: true,
        },
      ],
      videos: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
variantSchema.index({ id: 1 });
variantSchema.index({ productId: 1, id: 1 }, { unique: true });
variantSchema.index({ sku: 1 });

// Virtual for inventory
variantSchema.virtual("inventory", {
  ref: "Inventory",
  localField: "_id",
  foreignField: "variantId",
  justOne: true,
});

// Pre-save middleware to generate SKU if not provided
variantSchema.pre("save", async function () {
  if (this.isNew && !this.sku) {
    const Product = mongoose.model("Product");
    const product = await Product.findById(this.productId).populate(
      "categoryId",
    );

    if (!product) {
      throw new Error("Product not found while generating SKU");
    }

    const categorySlug = product.categoryId?.slug
      ? product.categoryId.slug.substring(0, 2).toUpperCase()
      : "XX";

    this.sku = `${categorySlug}-${this.color
      .replace(/\s+/g, "")
      .substring(0, 3)
      .toUpperCase()}-${Date.now().toString().slice(-4)}`;
  }
});

export default mongoose.model("Variant", variantSchema);
