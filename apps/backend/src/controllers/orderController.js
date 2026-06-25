import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import BulkProduct from "../models/BulkProduct.js";
import Variant from "../models/Variant.js";
import BulkProductVariant from "../models/BulkProductVariant.js";
import Inventory from "../models/Inventory.js";
import {
  deductFromUserWallet,
  creditToAdminWallet,
} from "../services/walletService.js";
import { toStr } from "../utils/sanitize.js";

/**
 * Place order directly (Buy Now)
 */
export const buyNow = async (req, res) => {
  try {
    const {
      productId,
      productType,
      variantId,
      color,
      size,
      quantity,
      shippingAddress,
      phoneNumber,
      customDesign,
      anyText,
    } = req.body;

    // Purchases require login — userAuth guarantees req.user is set
    const userId = req.user._id;

    // 1. Resolve shippingAddress and phoneNumber (fall back to profile)
    let finalShippingAddress = shippingAddress || req.user.address;
    let finalPhoneNumber = phoneNumber || req.user.phone;

    // 2. Basic validation
    if (!productId || !productType || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId, productType, and quantity are required.",
      });
    }

    if (!["ready", "bulk"].includes(productType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productType. Must be 'ready' or 'bulk'.",
      });
    }

    if (!finalShippingAddress || !finalPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and phone number are required.",
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer.",
      });
    }

    // Validate shippingAddress structure
    const { street, city, state, pincode } = finalShippingAddress || {};
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "shippingAddress must contain street, city, state, and pincode.",
      });
    }

    let resolvedVariantId;
    let resolvedColor = color;
    let resolvedSize = size;
    let totalAmount = 0;

    // 2. Process Ready Product
    if (productType === "ready") {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      // Resolve variant
      let variant;
      if (variantId) {
        variant = await Variant.findOne({ _id: variantId, productId });
      } else if (color) {
        variant = await Variant.findOne({ productId, color });
      } else {
        // Fallback to any variant if neither is provided
        variant = await Variant.findOne({ productId });
      }

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: "No matching variant found for the product.",
        });
      }

      resolvedVariantId = variant._id;
      resolvedColor = variant.color;

      // Size validation
      if (!resolvedSize) {
        if (product.sizes && product.sizes.length > 0) {
          resolvedSize = product.sizes[0];
        } else {
          resolvedSize = "OS"; // One Size
        }
      }

      // Calculate price
      const basePrice = product.basePrice;
      const priceAdjustment = variant.addPercentageInBasePrice || 0;
      const adjustedUnitPrice = basePrice + (basePrice * priceAdjustment) / 100;
      const subtotal = adjustedUnitPrice * qty;
      const discount = (subtotal * (product.discountPercentage || 0)) / 100;
      totalAmount = subtotal - discount;
      // Stock is reserved transactionally below (together with wallet payment).

    } else {
      // 3. Process Bulk Product
      const bulkProduct = await BulkProduct.findById(productId);
      if (!bulkProduct) {
        return res.status(404).json({
          success: false,
          message: "Bulk product not found.",
        });
      }

      // Resolve variant
      let variant;
      if (variantId) {
        variant = await BulkProductVariant.findOne({ _id: variantId, bulkProductId: productId });
      } else if (color) {
        variant = await BulkProductVariant.findOne({ bulkProductId: productId, color });
      } else {
        variant = await BulkProductVariant.findOne({ bulkProductId: productId });
      }

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: "No matching variant found for the bulk product.",
        });
      }

      resolvedVariantId = variant._id;
      resolvedColor = variant.color;

      // Size validation
      if (!resolvedSize) {
        if (bulkProduct.sizes && bulkProduct.sizes.length > 0) {
          resolvedSize = bulkProduct.sizes[0];
        } else {
          resolvedSize = "OS";
        }
      }

      // Calculate bulk price based on GSM tiers.
      // The quantity must match a defined tier exactly — previously a
      // non-matching quantity silently fell back to the first (cheapest) tier,
      // letting a buyer pay the lowest tier's rate for any quantity.
      const basePrice = bulkProduct.basePrice;
      const tier = variant.gsmPricingTiers.find((t) => t.gsmQuantity === qty);
      if (!tier) {
        const allowed = variant.gsmPricingTiers
          .map((t) => t.gsmQuantity)
          .join(", ");
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for this bulk product. Allowed quantities: ${allowed}.`,
        });
      }
      const addPercentage = tier.addPercentage || 0;
      const priceWithAddPercentage = basePrice + (basePrice * addPercentage) / 100;
      totalAmount = priceWithAddPercentage * qty;
    }

    // 4. Generate Order ID
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${timestamp}-${random}`;

    // 5. Reserve stock, charge the wallet and create the order — all inside one
    // transaction so stock is never consumed and the wallet is never debited
    // unless the order is actually persisted.
    let newOrder;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Reserve stock for ready products (bulk has no tracked inventory)
        if (productType === "ready") {
          const reserved = await Inventory.findOneAndUpdate(
            { variantId: resolvedVariantId, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { new: true, session }
          );
          if (!reserved) {
            throw new AppError("Insufficient stock for the selected variant.", 400);
          }
        }

        // Pay from the user's wallet up front (login is required to purchase).
        await deductFromUserWallet(userId, totalAmount, `PAY-${orderId}`, session);
        await creditToAdminWallet(totalAmount, `APAY-${orderId}`, session);

        const created = await Order.create(
          [
            {
              orderId,
              userId,
              productType,
              productId,
              productModel: productType === "ready" ? "Product" : "BulkProduct",
              variantId: resolvedVariantId,
              variantModel:
                productType === "ready" ? "Variant" : "BulkProductVariant",
              color: resolvedColor,
              size: resolvedSize,
              quantity: qty,
              totalAmount,
              shippingAddress: finalShippingAddress,
              phoneNumber: finalPhoneNumber,
              customDesign,
              anyText,
              orderStatus: "pending",
              paymentStatus: "paid",
            },
          ],
          { session }
        );
        newOrder = created[0];
      });
    } catch (txErr) {
      // Insufficient wallet balance surfaces as a clear 402
      if (txErr instanceof AppError) {
        return res
          .status(txErr.statusCode)
          .json({ success: false, message: txErr.message });
      }
      if (txErr.message === "Insufficient balance") {
        return res.status(402).json({
          success: false,
          message: "Insufficient wallet balance. Please recharge your wallet.",
        });
      }
      throw txErr;
    } finally {
      session.endSession();
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get logged-in user order history
 */
export const getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productType } = req.query;

    const query = { userId };
    if (productType && ["ready", "bulk"].includes(productType)) {
      query.productType = productType;
    }

    const orders = await Order.find(query)
      .populate("productId")
      .populate("variantId")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject ? order.toObject() : order;
      if (orderObj.productId) {
        orderObj.productId.name = orderObj.productId.title || orderObj.productId.name || "";
      }
      return orderObj;
    });

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      data: formattedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single order details by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    // Fetch order matching either _id or orderId, owned by the logged-in user
    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      userId,
    })
      .populate("productId")
      .populate("variantId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const orderObj = order.toObject ? order.toObject() : order;
    if (orderObj.productId) {
      orderObj.productId.name = orderObj.productId.title || orderObj.productId.name || "";
    }

    res.status(200).json({
      success: true,
      data: orderObj,
      order: orderObj, // fallback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user order history for admin
 */
export const getAdminUserOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("productId")
      .populate("variantId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all orders for admin
 */
export const getAdminAllOrders = async (req, res) => {
  try {
    const { productType, orderStatus } = req.query;

    const query = {};
    if (productType && ["ready", "bulk"].includes(productType)) {
      query.productType = productType;
    }
    if (orderStatus) {
      query.orderStatus = toStr(orderStatus);
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("productId")
      .populate("variantId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
