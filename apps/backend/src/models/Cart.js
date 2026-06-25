import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    productType: {
        type: String,
        required: true,
        enum: ["ready"],
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    size: {
        type: String,
        required: true,
    },
    priceAtTime: {
        type: Number,
        required: true,
        min: 0,
    },

    addedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true }, );

// Indexes
cartItemSchema.index({ userId: 1 });
cartItemSchema.index({ userId: 1, productId: 1, variantId: 1 });
cartItemSchema.index({ addedAt: -1 });


export default mongoose.model('Cart', cartItemSchema);