import mongoose from "mongoose";

const bulkProductSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^BULK\d{3}$/, "Format should be BULK001"],
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    uploadYourDesign: {
        type: String,
        enum: ["required", "optional"],
        default: "optional",
    },

    anyText: {
        type: String,
        enum: ["required", "optional"],
        default: "optional",
    },

    sizes: [{
        type: String,
        uppercase: true,
    }, ],

    // AVAILABLE COLORS
    colors: [{
        type: String,
        trim: true,
    }, ],

    // AVAILABLE PACKAGE QUANTITIES
    quantities: [{
        type: Number,
        min: 1,
    }, ],

    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },

    customizationTypes: [{
        type: {
            type: String,
            enum: ["DTF", "Screen", "Embroidery", "Heat Transfer"],
            required: true,
        },
        addPercentage: {
            type: Number,
            min: 0,
            default: 0,
        },
    }, ],

    gsmQuantity: [{
        type: Number,
        required: true,
        min: 1,
    }, ],

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
});

bulkProductSchema.index({ categoryId: 1 });
bulkProductSchema.index({ status: 1 });

export default mongoose.model(
    "BulkProduct",
    bulkProductSchema
);