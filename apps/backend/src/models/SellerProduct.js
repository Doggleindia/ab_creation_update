import mongoose from "mongoose";

// A seller-submitted product design awaiting admin approval. On approval it
// is published into the main catalog (Product + Variant + Inventory) and
// linked back via publishedProductId.
const sellerProductSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // The catalog garment this design is printed on
    baseProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    baseProductName: { type: String, trim: true },

    method: {
      type: String,
      enum: ["DTF", "Screen", "Embroidery", "Heat Transfer"],
      default: "DTF",
    },
    color: { type: String, trim: true, default: "White" },
    retailPrice: { type: Number, required: true, min: 1 },
    sizes: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "changes"],
      default: "pending",
      index: true,
    },

    // Admin review aids
    adminNotes: { type: String, trim: true },
    checklist: { type: [String], default: [] },
    rejectionReason: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },

    publishedProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true },
);

sellerProductSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("SellerProduct", sellerProductSchema);
