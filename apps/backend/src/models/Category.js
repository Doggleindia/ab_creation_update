import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^CAT\d{3}$/, "Category ID must be in format CATXXX"],
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-z0-9-]+$/,
            "Slug must contain only lowercase letters, numbers, and hyphens",
        ],
    },
    images: [{
        type: String,
        trim: true,
    }, ],
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}, );

// id and slug are already indexed via `unique: true` on their fields

// Virtual for products count
categorySchema.virtual('productsCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId',
    count: true,
});

export default mongoose.model('Category', categorySchema);