import Variant from "../models/Variant.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import AppError from "../utils/AppError.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { deleteFileFromS3ByUrl } from "../config/deleteFileFromS3ByUrl.js";

/**
 * =========================
 * S3 HELPERS
 * =========================
 */
const uploadFilesToS3 = async (files = []) => {
  const uploaded = [];

  for (const file of files) {
    const result = await uploadFileToS3(file);
    if (result?.Location) uploaded.push(result.Location);
  }

  return uploaded;
};

const deleteFilesFromS3 = async (urls = []) => {
  for (const url of urls || []) {
    if (url) await deleteFileFromS3ByUrl(url);
  }
};

/**
 * =========================
 * CREATE VARIANT (CLEAN)
 * =========================
 */
export const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return next(new AppError("Product not found", 404));

    // duplicate check
    const exists = await Variant.findOne({
      productId,
      id: req.body.id,
    });

    if (exists) {
      return next(new AppError("Variant ID already exists", 400));
    }

    // SKU check
    if (req.body.sku) {
      const skuExists = await Variant.findOne({ sku: req.body.sku });
      if (skuExists) return next(new AppError("SKU already exists", 400));
    }

    // validate discount
    if (req.body.addPercentageInBasePrice < -100) {
      return next(
        new AppError("addPercentageInBasePrice cannot be less than -100", 400)
      );
    }

    /**
     * =========================
     * FILE HANDLING (BULK STYLE)
     * =========================
     */
    if (req.files?.images?.length) {
      req.body.media = {
        ...req.body.media,
        images: await uploadFilesToS3(req.files.images),
      };
    }

    if (req.files?.videos?.length) {
      req.body.media = {
        ...req.body.media,
        videos: await uploadFilesToS3(req.files.videos),
      };
    }

    /**
     * =========================
     * CREATE VARIANT
     * =========================
     */
    const variant = await Variant.create({
      ...req.body,
      productId,
    });

    // inventory create
    await Inventory.create({
      variantId: variant._id,
      stock: 0,
      reservedStock: 0,
    });

    await variant.populate("productId", "basePrice");

    const calculatedPrice =
      product.basePrice *
      (1 + (req.body.addPercentageInBasePrice || 0) / 100);

    res.status(201).json({
      status: "success",
      data: {
        variant,
        basePrice: product.basePrice,
        calculatedPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================
 * UPDATE VARIANT (CLEAN)
 * =========================
 */
export const updateVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    const variant = await Variant.findOne({
      _id: variantId,
      productId,
    });

    if (!variant) {
      return next(new AppError("Variant not found", 404));
    }

    // SKU check
    if (req.body.sku) {
      const skuExists = await Variant.findOne({
        sku: req.body.sku,
        _id: { $ne: variant._id },
      });

      if (skuExists) {
        return next(new AppError("SKU already exists", 400));
      }
    }

    // file handling same
    if (req.files?.images?.length) {
      await deleteFilesFromS3(variant.media?.images);

      req.body.media = {
        ...variant.media,
        images: await uploadFilesToS3(req.files.images),
      };
    }

    if (req.files?.videos?.length) {
      await deleteFilesFromS3(variant.media?.videos);

      req.body.media = {
        ...variant.media,
        videos: await uploadFilesToS3(req.files.videos),
      };
    }

    // Allowlist updatable fields (prevents mass assignment of id/productId/etc.)
    for (const key of ["color", "sku", "addPercentageInBasePrice", "media"]) {
      if (req.body[key] !== undefined) variant[key] = req.body[key];
    }
    await variant.save();

    await variant.populate("productId", "basePrice");

    const finalPrice =
      variant.productId.basePrice *
      (1 + (variant.addPercentageInBasePrice || 0) / 100);

    res.json({
      status: "success",
      data: {
        variant,
        finalPrice,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================
 * GET VARIANTS (ADMIN)
 * =========================
 */
export const getProductVariants = async (req, res, next) => {
  try {
    const variants = await Variant.find({
      productId: req.params.productId,
    }).populate("inventory");

    res.json({
      success: true,
      results: variants.length,
      data: variants,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================
 * GET SINGLE VARIANT
 * =========================
 */
export const getVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    const variant = await Variant.findOne({
      _id: variantId,
      productId,
    })
      .populate("productId", "title")
      .populate("inventory");

    if (!variant) {
      return next(new AppError("Variant not found", 404));
    }

    res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * =========================
 * DELETE VARIANT
 * =========================
 */
export const deleteVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    const variant = await Variant.findOne({
      _id: variantId,
      productId,
    });

    if (!variant) {
      return next(new AppError("Variant not found", 404));
    }

    // OPTIONAL: delete media from S3
    if (variant.media?.images?.length) {
      await deleteFilesFromS3(variant.media.images);
    }

    if (variant.media?.videos?.length) {
      await deleteFilesFromS3(variant.media.videos);
    }

    // delete inventory linked to variant
    await Inventory.deleteOne({ variantId: variant._id });

    // delete variant itself
    await Variant.deleteOne({ _id: variant._id });

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};