import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    productType: {
      type: String,
      required: true,
      enum: ["ready", "bulk"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "productModel",
    },
    productModel: {
      type: String,
      required: true,
      enum: ["Product", "BulkProduct"],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "variantModel",
    },
    variantModel: {
      type: String,
      required: true,
      enum: ["Variant", "BulkProductVariant"],
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    guestName: {
      type: String,
    },
    guestEmail: {
      type: String,
    },
    customDesign: {
      type: String,
    },
    designFiles: {
      type: [String],
      default: [],
    },
    designState: {
      type: mongoose.Schema.Types.Mixed,
    },
    anyText: {
      type: String,
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "rush"],
      default: "standard",
    },
    carrier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    internalNote: { type: String, trim: true },

    orderStatus: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "in_production", "quality_check", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1 });
// orderId is already uniquely indexed via `unique: true` on the field
orderSchema.index({ productType: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
