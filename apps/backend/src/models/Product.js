import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^PROD\d{3}$/, "Product ID must be in format PRODXXX"],
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    sizes: [{
        type: String,
        trim: true,
        uppercase: true,
    }, ],

    // AVAILABLE COLORS
    colors: [{
        type: String,
        trim: true,
    }, ],

    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    customizationTypes: [{
        type: String,
        enum: ["DTF", "Screen", "Embroidery", "Heat Transfer"],
        required: true,
    }, ],
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    seo: {
        metaKeywords: [{
            type: String,
            trim: true,
        }, ],
        metaTitle: {
            type: String,
            trim: true,
        },
        metaDescription: {
            type: String,
            trim: true,
        },
        canonicalUrl: {
            type: String,
            trim: true,
        },
        ogTitle: {
            type: String,
            trim: true,
        },
        ogDescription: {
            type: String,
            trim: true,
        },
        ogImage: {
            type: String,
            trim: true,
        },
        ogType: {
            type: String,
            trim: true,
        },
        ogUrl: {
            type: String,
            trim: true,
        },
        schemaMarkup: {
            type: String,
            trim: true,
        },
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },

    // ✅ PRODUCT DETAILS
    productDetails: [{
        type: String,
        trim: true,
    }],

    // ✅ MATERIAL & CARE
    materialAndCare: {
        material: {
            type: String,
            trim: true,
        },

        careInstructions: [{
            type: String,
            trim: true,
        }],
    },

    // ✅ SPECIFICATIONS
    specifications: {
        fabric: {
            type: String,
            trim: true,
        },

        gsm: {
            type: String,
            trim: true,
        },

        fashionType: {
            type: String,
            trim: true,
        },

        fit: {
            type: String,
            trim: true,
        },

        type: {
            type: String,
            trim: true,
        },

        neck: {
            type: String,
            trim: true,
        },

        sleeveLength: {
            type: String,
            trim: true,
        },

        pattern: {
            type: String,
            trim: true,
        },

        occasion: {
            type: String,
            trim: true,
        },

        closure: {
            type: String,
            trim: true,
        },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
}, );

// Indexes for performance (id is already indexed via `unique: true`)
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ sizes: 1 });

// Virtual for variants count
productSchema.virtual("variantsCount", {
    ref: "Variant",
    localField: "_id",
    foreignField: "productId",
    count: true,
});

// Virtual for the variant documents themselves (populate explicitly)
productSchema.virtual("variants", {
    ref: "Variant",
    localField: "_id",
    foreignField: "productId",
});

// Pre-save validation for publishing
productSchema.pre("save", async function() {
    if (this.status === "published") {
        // Check if category exists
        const Category = mongoose.model("Category");
        const category = await Category.findById(this.categoryId);

        if (!category) {
            throw new Error("Cannot publish product: Category not found");
        }

        // Check if customization types exist
        if (!this.customizationTypes || this.customizationTypes.length === 0) {
            throw new Error(
                "Cannot publish product: No customization types specified",
            );
        }

        // Check if variants exist
        const Variant = mongoose.model("Variant");
        const variantsCount = await Variant.countDocuments({ productId: this._id });

        if (variantsCount === 0) {
            throw new Error("Cannot publish product: No variants exist");
        }

        // Check inventory for all variants
        const Inventory = mongoose.model("Inventory");
        const variants = await Variant.find({ productId: this._id });

        for (const variant of variants) {
            const inventory = await Inventory.findOne({ variantId: variant._id });

            if (!inventory || inventory.stock < 0) {
                throw new Error(
                    `Cannot publish product: Invalid inventory for variant ${variant.id}`,
                );
            }
        }
    }
});


export default mongoose.model('Product', productSchema);