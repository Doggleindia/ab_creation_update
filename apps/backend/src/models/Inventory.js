import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// variantId is already uniquely indexed via `unique: true` on the field

// Virtual for availableStock
inventorySchema.virtual('availableStock').get(function() {
  return this.stock - this.reservedStock;
});

// Pre-save validation
inventorySchema.pre('save', async function () {
  if (this.reservedStock > this.stock) {
    throw new Error('Reserved stock cannot exceed total stock');
  }
});

export default mongoose.model('Inventory', inventorySchema);
