import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^COL\d{3}$/, "Collection ID must be in format COLXXX"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: ["MENS-COLLECTIONS", "WOMENS-COLLECTIONS", "KIDS-COLLECTIONS"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance (id and slug are already indexed via `unique: true`)
collectionSchema.index({ status: 1 });

export default mongoose.model('Collection', collectionSchema);
