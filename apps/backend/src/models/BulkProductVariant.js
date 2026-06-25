import mongoose from "mongoose";

const bulkProductVariantSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        match: [/^BVAR\d{3}$/, "Format should be BVAR001"],
    },

    bulkProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BulkProduct",
        required: true,
    },

    color: {
        type: String,
        required: true,
    },

    gsmPricingTiers: [{
        gsmQuantity: {
            type: Number,
            required: true,
            min: 1,
        },
        addPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        // Computed in the pre-save hook (total price for this tier's quantity).
        // Declared here so Mongoose actually persists it instead of stripping it.
        finalPrice: {
            type: Number,
            min: 0,
        },
    }, ],

    sku: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
    },

    images: [{
        type: String,
    }, ],
}, {
    timestamps: true,
});

bulkProductVariantSchema.pre("save", async function() {

    const BulkProduct = mongoose.model("BulkProduct");

    const bulkProduct = await BulkProduct.findById(
        this.bulkProductId
    );

    if (!bulkProduct) {
        throw new Error("BulkProduct not found");
    }

    const basePrice = bulkProduct.basePrice;

    // Calculate finalPrice for each tier
    if (this.gsmPricingTiers && this.gsmPricingTiers.length > 0) {
        this.gsmPricingTiers.forEach((tier) => {
            const priceWithAddPercentage =
                basePrice +
                (basePrice * tier.addPercentage) / 100;

            tier.finalPrice =
                priceWithAddPercentage * tier.gsmQuantity;
        });
    }

    if (!this.sku) {
        const firstTier = this.gsmPricingTiers && this.gsmPricingTiers.length > 0 ?
            this.gsmPricingTiers[0] :
            null;

        const gsmQty = firstTier && firstTier.gsmQuantity ?
            firstTier.gsmQuantity :
            1;
        this.sku = `BULK-${this.color
      .substring(0, 3)
      .toUpperCase()}-${gsmQty}`;
    }
});

bulkProductVariantSchema.index({ bulkProductId: 1, id: 1 }, { unique: true });

export default mongoose.model(
    "BulkProductVariant",
    bulkProductVariantSchema
);