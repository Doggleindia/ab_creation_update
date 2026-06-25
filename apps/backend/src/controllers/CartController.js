import Cart from '../models/Cart.js';
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
import Inventory from "../models/Inventory.js";

// Add item to cart
export const addToCart = async(req, res) => {
    try {
        const { productType, productId, variantId, quantity, size } = req.body;

        const userId = req.user._id;

        // Validate product type
        if (productType !== "ready") {
            return res.status(400).json({
                success: false,
                message: "Invalid product type",
            });
        }

        // Find variant + product
        const variant = await Variant.findById(variantId).populate("productId");

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }

        // Product validation
        if (variant.productId._id.toString() !== productId) {
            return res.status(400).json({
                success: false,
                message: "Product mismatch",
            });
        }

        // Inventory check
        const inventory = await Inventory.findOne({ variantId });

        if (!inventory || inventory.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
        }

        // Base price
        const basePrice = variant.productId.basePrice;

        // Variant price adjustment
        // Example:
        // 8  => +8%
        // -4 => -4%
        const priceAdjustment =
            variant.addPercentageInBasePrice || 0;

        // Adjusted unit price
        const adjustedUnitPrice =
            basePrice +
            (basePrice * priceAdjustment) / 100;

        // Existing cart item check
        let cartItem = await Cart.findOne({
            userId,
            productId,
            variantId,
            size,
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                userId,
                productType: "ready",
                productId,
                variantId,
                size,
                quantity,

                // Save adjusted price
                priceAtTime: adjustedUnitPrice,
            });
        }

        // Discount percentage from product
        const discountPercentage =
            variant.productId.discountPercentage || 0;

        // Pricing calculations
        const subtotal =
            adjustedUnitPrice * cartItem.quantity;

        // Discount amount
        const discount =
            (subtotal * discountPercentage) / 100;

        // Final total
        const finalTotal =
            subtotal - discount;

        // Final response
        res.status(201).json({
            success: true,
            message: "Item added to cart",

            cartItem: {
                _id: cartItem._id,

                productId: cartItem.productId,

                variantId: cartItem.variantId,

                quantity: cartItem.quantity,

                snapshot: {
                    title: variant.productId.title,

                    image: variant.media &&
                        variant.media.images &&
                        variant.media.images.length > 0 ?
                        variant.media.images[0] : "",

                    size: size,

                    color: variant.color,
                },

                pricing: {
                    unitPrice: adjustedUnitPrice,

                    subtotal,

                    discount,

                    finalTotal,

                    currency: "INR",
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Get user's cart
export const getCart = async(req, res) => {
    try {
        const userId = req.user._id;

        const cartItems = await Cart.find({ userId })
            .populate({
                path: "productId",
                select: "title basePrice discountPercentage",
            })
            .populate({
                path: "variantId",
                select: "color price media",
            })
            .sort({ addedAt: -1 });

        const formattedCartItems = cartItems
            .filter(item => item.productId && item.variantId)
            .map((item) => {

                const unitPrice = item.priceAtTime;

                const subtotal = unitPrice * item.quantity;

                // Get discount percentage from product
                const discountPercentage =
                    item.productId.discountPercentage || 0;

                const discount =
                    (subtotal * discountPercentage) / 100;

                const finalTotal = subtotal - discount;

                return {
                    _id: item._id,

                    productId: item.productId ?
                        item.productId._id : null,

                    variantId: item.variantId ?
                        item.variantId._id : null,

                    quantity: item.quantity,

                    snapshot: {
                        title: item.productId ?
                            item.productId.title : "",

                        image: item.variantId &&
                            item.variantId.media &&
                            item.variantId.media.images &&
                            item.variantId.media.images.length > 0 ?
                            item.variantId.media.images[0] : "",

                        size: item.size || "",

                        color: item.variantId ?
                            item.variantId.color : "",
                    },

                    pricing: {
                        unitPrice,

                        subtotal,

                        discount,

                        finalTotal,

                        currency: "INR",
                    },
                };
            });

        // Grand total
        const grandTotal = formattedCartItems.reduce(
            (sum, item) => sum + item.pricing.finalTotal,
            0
        );

        res.status(200).json({
            success: true,

            cartItems: formattedCartItems,

            grandTotal,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update cart item quantity
export const updateCartItem = async(req, res) => {
    try {
        const { cartItemId, quantity } = req.body;

        const userId = req.user._id;

        const cartItem = await Cart.findOne({
                _id: cartItemId,
                userId,
            })
            .populate({
                path: "productId",
                select: "title basePrice discountPercentage",
            })
            .populate({
                path: "variantId",
                select: "color price media",
            });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        // Inventory check
        const inventory = await Inventory.findOne({
            variantId: cartItem.variantId._id,
        });

        if (!inventory || inventory.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
        }

        // Update quantity
        cartItem.quantity = quantity;

        await cartItem.save();

        // Pricing
        const unitPrice = cartItem.priceAtTime;

        const subtotal = unitPrice * quantity;

        // Get discount percentage from product
        const discountPercentage =
            cartItem.productId.discountPercentage || 0;

        const discount =
            (subtotal * discountPercentage) / 100;

        const finalTotal = subtotal - discount;

        // Image
        let image = "";

        if (
            cartItem.variantId.media &&
            cartItem.variantId.media.images &&
            cartItem.variantId.media.images.length > 0
        ) {
            image = cartItem.variantId.media.images[0];
        }

        res.status(200).json({
            success: true,
            message: "Cart item updated",

            cartItem: {
                _id: cartItem._id,

                productId: cartItem.productId._id,

                variantId: cartItem.variantId._id,

                quantity: cartItem.quantity,

                snapshot: {
                    title: cartItem.productId.title,
                    image,
                    size: cartItem.size || "",
                    color: cartItem.variantId.color || "",
                },

                pricing: {
                    unitPrice,
                    subtotal,
                    discount,
                    finalTotal,
                    currency: "INR",
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Remove item from cart
export const removeFromCart = async(req, res) => {
    try {
        const { cartItemId } = req.params;
        const userId = req.user._id;

        const cartItem = await Cart.findOneAndDelete({ _id: cartItemId, userId });
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all carts (for analytics)  ADMIN
export const getAllCarts = async(req, res) => {
    try {
        const carts = await Cart.aggregate([{
                $group: {
                    _id: '$userId',
                    items: { $push: '$$ROOT' },
                    totalItems: { $sum: 1 },
                    lastUpdated: { $max: '$updatedAt' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    userId: '$_id',
                    userName: '$user.name',
                    userEmail: '$user.email',
                    totalItems: 1,
                    lastUpdated: 1,
                    items: 1,
                },
            },
            {
                $sort: { lastUpdated: -1 },
            },
        ]);

        res.status(200).json({ carts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};