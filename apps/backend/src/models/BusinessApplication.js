import mongoose from "mongoose";

/**
 * A single record backs both the "Seller" and "Bulk buyer" onboarding queues.
 * `type` decides which public form created it, which admin queue it shows up in,
 * and which User.accountType is granted on approval. Type-specific fields live
 * side by side and are simply left blank for the other type.
 */
const businessApplicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["bulk", "seller"],
      required: true,
      index: true,
    },

    // Shared contact details
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true, default: "India" },
    },
    message: {
      type: String,
      trim: true,
    },

    // Bulk-specific
    expectedVolume: { type: String, trim: true },
    orderFrequency: { type: String, trim: true },
    gstNumber: { type: String, trim: true },

    // Seller-specific
    brandName: { type: String, trim: true },
    website: { type: String, trim: true },
    productsToSell: { type: String, trim: true },

    // Shared: categories of interest (bulk) / products (seller)
    categories: {
      type: [String],
      default: [],
    },

    // Hosted portfolio images uploaded with the application
    portfolioFiles: {
      type: [String],
      default: [],
    },

    // Admin review aids
    priority: { type: Boolean, default: false },
    internalNotes: { type: String, trim: true },
    checklist: { type: [String], default: [] },

    // Bulk-order quote sent by the admin; the applicant reviews it on a
    // public quote page and accepts or declines. After acceptance the admin
    // advances fulfilment: accepted -> in_production -> completed.
    quote: {
      amount: { type: Number, min: 0 },
      notes: { type: String, trim: true },
      status: {
        type: String,
        enum: ["sent", "accepted", "declined", "in_production", "completed"],
      },
      sentAt: Date,
      respondedAt: Date,
    },

    // Team member handling this request
    assignee: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: {
      type: Date,
    },

    // The User account created when this application is approved.
    linkedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Common admin queue view: newest pending first, filtered by type/status.
businessApplicationSchema.index({ type: 1, status: 1, createdAt: -1 });

export default mongoose.model("BusinessApplication", businessApplicationSchema);
