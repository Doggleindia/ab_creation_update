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
import { uploadFileToS3 } from "../config/s3Service.js";

/**
 * Upload one or more customer design files to S3 and return their URLs.
 * Used by the customization flows so the actual artwork is stored on the order.
 */
export const uploadDesigns = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res
        .status(400)
        .json({ success: false, message: "No design files uploaded." });
    }

    const urls = [];
    for (const file of files) {
      const result = await uploadFileToS3(file);
      if (result?.Location) urls.push(result.Location);
    }

    return res.status(200).json({ success: true, data: { urls } });
  } catch (err) {
    console.error("uploadDesigns error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to upload design files.",
    });
  }
};

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
      designFiles,
      designState,
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
              designFiles: Array.isArray(designFiles) ? designFiles : [],
              designState: designState || undefined,
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
 * Resolve a single cart line into the data needed to place an order.
 * Read-only (no writes); throws AppError on any problem so the whole
 * checkout can be aborted atomically.
 */
const resolveCheckoutItem = async (item) => {
  const { productId, productType, variantId, color, size, quantity } = item;

  if (!productId || !productType) {
    throw new AppError("Each item needs productId and productType.", 400);
  }
  if (!["ready", "bulk"].includes(productType)) {
    throw new AppError("Invalid productType. Must be 'ready' or 'bulk'.", 400);
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new AppError("Each item quantity must be a positive integer.", 400);
  }

  let resolvedVariantId;
  let resolvedColor = color;
  let resolvedSize = size;
  let totalAmount = 0;

  if (productType === "ready") {
    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found.", 404);

    let variant;
    if (variantId) variant = await Variant.findOne({ _id: variantId, productId });
    else if (color) variant = await Variant.findOne({ productId, color });
    else variant = await Variant.findOne({ productId });
    if (!variant) throw new AppError("No matching variant found for the product.", 400);

    resolvedVariantId = variant._id;
    resolvedColor = variant.color;
    if (!resolvedSize) {
      resolvedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "OS";
    }

    const basePrice = product.basePrice;
    const priceAdjustment = variant.addPercentageInBasePrice || 0;
    const adjustedUnitPrice = basePrice + (basePrice * priceAdjustment) / 100;
    const subtotal = adjustedUnitPrice * qty;
    const discount = (subtotal * (product.discountPercentage || 0)) / 100;
    totalAmount = subtotal - discount;
  } else {
    const bulkProduct = await BulkProduct.findById(productId);
    if (!bulkProduct) throw new AppError("Bulk product not found.", 404);

    let variant;
    if (variantId) variant = await BulkProductVariant.findOne({ _id: variantId, bulkProductId: productId });
    else if (color) variant = await BulkProductVariant.findOne({ bulkProductId: productId, color });
    else variant = await BulkProductVariant.findOne({ bulkProductId: productId });
    if (!variant) throw new AppError("No matching variant found for the bulk product.", 400);

    resolvedVariantId = variant._id;
    resolvedColor = variant.color;
    if (!resolvedSize) {
      resolvedSize = bulkProduct.sizes && bulkProduct.sizes.length > 0 ? bulkProduct.sizes[0] : "OS";
    }

    const tier = variant.gsmPricingTiers.find((t) => t.gsmQuantity === qty);
    if (!tier) {
      const allowed = variant.gsmPricingTiers.map((t) => t.gsmQuantity).join(", ");
      throw new AppError(`Invalid quantity for bulk product. Allowed: ${allowed}.`, 400);
    }
    const addPercentage = tier.addPercentage || 0;
    totalAmount = (bulkProduct.basePrice + (bulkProduct.basePrice * addPercentage) / 100) * qty;
  }

  return {
    productId,
    productType,
    qty,
    resolvedVariantId,
    resolvedColor,
    resolvedSize,
    totalAmount,
    customDesign: item.customDesign,
    designFiles: Array.isArray(item.designFiles) ? item.designFiles : [],
    designState: item.designState || undefined,
    anyText: item.anyText,
  };
};

/**
 * Place a whole cart in ONE transaction: reserve all stock, charge the wallet
 * once, and create all order documents together. If anything fails (e.g.
 * insufficient stock or balance) the entire checkout rolls back — no partial
 * orders and no double charges.
 * POST /api/orders/checkout
 */
export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, shippingAddress, phoneNumber } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const finalShippingAddress = shippingAddress || req.user.address;
    const finalPhoneNumber = phoneNumber || req.user.phone;
    if (!finalShippingAddress || !finalPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and phone number are required.",
      });
    }
    const { street, city, state, pincode } = finalShippingAddress;
    if (!street || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "shippingAddress must contain street, city, state, and pincode.",
      });
    }

    // Resolve every line first (read-only). Any AppError aborts the checkout.
    let resolved;
    try {
      resolved = await Promise.all(items.map((it) => resolveCheckoutItem(it)));
    } catch (resolveErr) {
      if (resolveErr instanceof AppError) {
        return res.status(resolveErr.statusCode).json({ success: false, message: resolveErr.message });
      }
      throw resolveErr;
    }

    const grandTotal = resolved.reduce((sum, r) => sum + r.totalAmount, 0);

    const batchId = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let createdOrders;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Reserve stock for every ready item
        for (const r of resolved) {
          if (r.productType === "ready") {
            const reserved = await Inventory.findOneAndUpdate(
              { variantId: r.resolvedVariantId, stock: { $gte: r.qty } },
              { $inc: { stock: -r.qty } },
              { new: true, session }
            );
            if (!reserved) {
              throw new AppError("Insufficient stock for one of the items.", 400);
            }
          }
        }

        // Charge the wallet ONCE for the whole cart
        await deductFromUserWallet(userId, grandTotal, `PAY-CART-${batchId}`, session);
        await creditToAdminWallet(grandTotal, `APAY-CART-${batchId}`, session);

        // Create all order documents together
        const docs = resolved.map((r, i) => ({
          orderId: `ORD-${batchId}-${i + 1}`,
          userId,
          productType: r.productType,
          productId: r.productId,
          productModel: r.productType === "ready" ? "Product" : "BulkProduct",
          variantId: r.resolvedVariantId,
          variantModel: r.productType === "ready" ? "Variant" : "BulkProductVariant",
          color: r.resolvedColor,
          size: r.resolvedSize,
          quantity: r.qty,
          totalAmount: r.totalAmount,
          shippingAddress: finalShippingAddress,
          phoneNumber: finalPhoneNumber,
          customDesign: r.customDesign,
          designFiles: Array.isArray(r.designFiles) ? r.designFiles : [],
          designState: r.designState || undefined,
          anyText: r.anyText,
          orderStatus: "pending",
          paymentStatus: "paid",
        }));
        createdOrders = await Order.create(docs, { session, ordered: true });
      });
    } catch (txErr) {
      if (txErr instanceof AppError) {
        return res.status(txErr.statusCode).json({ success: false, message: txErr.message });
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
      data: { orders: createdOrders, grandTotal, orderId: createdOrders[0]?.orderId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    // Fetch order matching either _id or orderId, owned by the logged-in user.
    // Only match _id when the param is a valid ObjectId — a human orderId like
    // "ORD-..." would otherwise throw a CastError and turn into a 500.
    const idClauses = mongoose.isValidObjectId(orderId)
      ? [{ _id: orderId }, { orderId: orderId }]
      : [{ orderId: orderId }];
    const order = await Order.findOne({
      $or: idClauses,
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

/**
 * ADMIN — update an order's status (production pipeline).
 * PATCH /api/orders/admin/:orderId/status  { orderStatus }
 */
export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderStatus = toStr(req.body.orderStatus);

    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `orderStatus must be one of: ${allowed.join(", ")}`,
      });
    }

    const idClauses = mongoose.isValidObjectId(orderId)
      ? [{ _id: orderId }, { orderId: orderId }]
      : [{ orderId: orderId }];
    const order = await Order.findOneAndUpdate(
      { $or: idClauses },
      { orderStatus },
      { new: true },
    )
      .populate("userId", "name email")
      .populate("productId")
      .populate("variantId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
