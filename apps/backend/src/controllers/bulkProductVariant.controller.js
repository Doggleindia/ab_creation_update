import BulkProductVariant from "../models/BulkProductVariant.js";

import { uploadFileToS3 } from "../config/s3Service.js";
import { deleteFileFromS3ByUrl } from "../config/deleteFileFromS3ByUrl.js";

const uploadImagesToS3 = async(files = []) => {
    const uploaded = [];

    for (const file of files) {
        const result = await uploadFileToS3(file);
        if (result && result.Location) {
            uploaded.push(result.Location);
        }
    }

    return uploaded;
};

const deleteImagesFromS3 = async(urls = []) => {
    for (const url of urls) {
        if (!url) continue;
        await deleteFileFromS3ByUrl(url);
    }
};

export const createBulkProductVariant = async(req, res) => {
    try {
        const { id, bulkProductId, color, gsmPricingTiers, sku } = req.body;

        // Validate required fields
        if (!id || !bulkProductId || !color || !gsmPricingTiers) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: id, bulkProductId, color, gsmPricingTiers",
            });
        }

        // Validate gsmPricingTiers is an array with at least one tier
        if (!Array.isArray(gsmPricingTiers) || gsmPricingTiers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "gsmPricingTiers must be a non-empty array",
            });
        }

        // Validate each tier has required fields
        for (let tier of gsmPricingTiers) {
            if (tier.gsmQuantity === undefined || tier.addPercentage === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Each tier must have gsmQuantity and addPercentage",
                });
            }
        }
        if (req.files && req.files.images && req.files.images.length) {
            const uploadedImageUrls = await uploadImagesToS3(req.files.images);
            req.body.images = uploadedImageUrls;
        }

        const variant = await BulkProductVariant.create(req.body);

        res.status(201).json({
            success: true,
            message: "Bulk product variant created successfully",
            data: variant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getVariantsByProduct = async(req, res) => {
    try {
        const variants = await BulkProductVariant.find({
            bulkProductId: req.params.productId,
        });

        res.json({
            success: true,
            count: variants.length,
            data: variants,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateBulkProductVariant = async(req, res) => {
    try {
        const { id } = req.params;
        const { gsmPricingTiers } = req.body;

        const variant = await BulkProductVariant.findById(id);

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Bulk product variant not found",
            });
        }

        // Validate gsmPricingTiers if provided
        if (gsmPricingTiers !== undefined) {
            if (!Array.isArray(gsmPricingTiers) || gsmPricingTiers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "gsmPricingTiers must be a non-empty array",
                });
            }

            // Validate each tier has required fields
            for (let tier of gsmPricingTiers) {
                if (tier.gsmQuantity === undefined || tier.addPercentage === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "Each tier must have gsmQuantity and addPercentage",
                    });
                }
            }
        }

        // If new images are uploaded, replace them (delete old ones first)
        if (req.files && req.files.images && req.files.images.length) {
            await deleteImagesFromS3(variant.images);

            const uploadedImageUrls = await uploadImagesToS3(req.files.images);
            req.body.images = uploadedImageUrls;
        }

        // Allowlist updatable fields (prevents mass assignment)
        for (const key of ["color", "gsmPricingTiers", "sku", "images"]) {
            if (req.body[key] !== undefined) variant[key] = req.body[key];
        }
        await variant.save();

        res.status(200).json({
            success: true,
            message: "Bulk product variant updated successfully",
            data: variant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getSingleVariantByProduct = async(req, res) => {
    try {

        const { productId, variantId } = req.params;

        const variant = await BulkProductVariant.findOne({
            _id: variantId,
            bulkProductId: productId,
        });

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }

        res.status(200).json({
            success: true,
            data: variant,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteBulkProductVariant = async(req, res) => {
    try {
        const { id } = req.params;
        const variant = await BulkProductVariant.findById(id);

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Bulk product variant not found",
            });
        }

        await deleteImagesFromS3(variant.images);
        await BulkProductVariant.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Bulk product variant deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};