import Inventory from '../models/Inventory.js';
import Variant from '../models/Variant.js';
import AppError from '../utils/AppError.js';

// Update Inventory for a Variant
export const updateInventory = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const { stock, reservedStock } = req.body;

    const variant = await Variant.findOne({
      _id: variantId,
      productId,
    });

    if (!variant) {
      return next(new AppError("Variant not found for this product", 404));
    }

    if (stock < 0 || reservedStock < 0) {
      return next(new AppError("Stock cannot be negative", 400));
    }

    if (reservedStock > stock) {
      return next(
        new AppError("Reserved stock cannot exceed total stock", 400)
      );
    }

    let inventory = await Inventory.findOne({ variantId: variant._id });

    if (!inventory) {
      inventory = await Inventory.create({
        variantId: variant._id,
        stock: stock || 0,
        reservedStock: reservedStock || 0,
      });
    } else {
      if (stock !== undefined) inventory.stock = stock;
      if (reservedStock !== undefined)
        inventory.reservedStock = reservedStock;

      await inventory.save();
    }

    await inventory.populate({
      path: "variantId",
      select: "id size color sku productId",
      populate: {
        path: "productId",
        select: "id title",
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        inventory: {
          ...inventory.toObject(),
          availableStock: inventory.stock - inventory.reservedStock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


// Get All Inventory of a Product
export const getProductInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // ✅ Check product exists
    const variants = await Variant.find({ productId })
      .populate({
        path: "inventory",
      })
      .select("id size color sku");

    if (!variants || variants.length === 0) {
      return next(new AppError("No variants found for this product", 404));
    }

    const result = variants.map((variant) => {
      const inventory = variant.inventory || null;

      return {
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        stock: inventory?.stock || 0,
        reservedStock: inventory?.reservedStock || 0,
        availableStock:
          inventory ? inventory.stock - inventory.reservedStock : 0,
      };
    });

    res.status(200).json({
      status: "success",
      results: result.length,
      data: {
        productId,
        inventories: result,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Get Inventory for a Variant
export const getVariantInventory = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    const variant = await Variant.findOne({
      _id: variantId,
      productId,
    });

    if (!variant) {
      return next(new AppError("Variant not found for this product", 404));
    }

    const inventory = await Inventory.findOne({ variantId: variant._id });

    if (!inventory) {
      return next(new AppError("Inventory not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        inventory: {
          ...inventory.toObject(),
          availableStock: inventory.stock - inventory.reservedStock,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



