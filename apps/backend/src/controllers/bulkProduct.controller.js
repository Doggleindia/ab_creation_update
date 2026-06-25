import BulkProduct from "../models/BulkProduct.js";
import BulkProductVariant from "../models/BulkProductVariant.js";
import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";

// CREATE
export const createBulkProduct = async(req, res, next) => {
    try {
        const {
            id,
            title,
            slug,
            categoryId,
            description,
            uploadYourDesign,
            anyText,
            sizes,
            colors,
            quantities,
            basePrice,
            customizationTypes,
            gsmQuantity,
            status,
            productDetails,
            materialAndCare,
            specifications,
        } = req.body;

        // CHECK CATEGORY
        const category = await Category.findById(categoryId);

        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        // CHECK DUPLICATE ID
        const existingId = await BulkProduct.findOne({ id });

        if (existingId) {
            return next(new AppError("Bulk product ID already exists", 400));
        }

        // CHECK DUPLICATE SLUG
        const existingSlug = await BulkProduct.findOne({ slug });

        if (existingSlug) {
            return next(new AppError("Slug already exists", 400));
        }

        const bulkProduct = await BulkProduct.create({
            id,
            title,
            slug,
            categoryId,
            description,
            uploadYourDesign,
            anyText,
            sizes,
            colors,
            quantities,
            basePrice,
            customizationTypes,
            gsmQuantity,
            status,
            productDetails,
            materialAndCare,
            specifications,
        });

        res.status(201).json({
            success: true,
            message: "Bulk product created successfully",
            data: bulkProduct,
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL
export const getBulkProducts = async(req, res, next) => {
    try {
        const bulkProducts = await BulkProduct.find()
            .populate("categoryId", "name slug")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            results: bulkProducts.length,
            data: bulkProducts,
        });
    } catch (error) {
        next(error);
    }
};

// PUBLIC: Get bulk products with their variants
export const getPublicBulkProducts = async(req, res, next) => {
    try {
        // Aggregate with lookup to include variants in response
        const bulkProducts = await BulkProduct.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "bulkproductvariants",
                    localField: "_id",
                    foreignField: "bulkProductId",
                    as: "variants",
                },
            },
            {
                $project: {
                    id: 1,
                    title: 1,
                    slug: 1,
                    categoryId: 1,
                    description: 1,
                    uploadYourDesign: 1,
                    anyText: 1,
                    sizes: 1,
                    colors: 1,
                    quantities: 1,
                    basePrice: 1,
                    customizationTypes: 1,
                    gsmQuantity: 1,
                    status: 1,
                    productDetails: 1,
                    materialAndCare: 1,
                    specifications: 1,
                    variants: 1,
                    createdAt: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            results: bulkProducts.length,
            data: bulkProducts,
        });
    } catch (error) {
        next(error);
    }
};

// GET SINGLE
export const getSingleBulkProduct = async(req, res, next) => {
    try {
        const { id } = req.params;

        const bulkProduct = await BulkProduct.findById(id).populate(
            "categoryId",
            "name slug"
        );

        if (!bulkProduct) {
            return next(new AppError("Bulk product not found", 404));
        }

        res.status(200).json({
            success: true,
            data: bulkProduct,
        });
    } catch (error) {
        next(error);
    }
};

// GET BY SLUG WITH VARIANTS
export const getBulkProductBySlug = async(req, res, next) => {
    try {
        const { slug } = req.params;

        const bulkProducts = await BulkProduct.aggregate([
            { $match: { slug } },
            {
                $lookup: {
                    from: "bulkproductvariants",
                    localField: "_id",
                    foreignField: "bulkProductId",
                    as: "variants",
                },
            },
            {
                $project: {
                    id: 1,
                    title: 1,
                    slug: 1,
                    categoryId: 1,
                    description: 1,
                    uploadYourDesign: 1,
                    anyText: 1,
                    sizes: 1,
                    colors: 1,
                    quantities: 1,
                    basePrice: 1,
                    customizationTypes: 1,
                    gsmQuantity: 1,
                    status: 1,
                    productDetails: 1,
                    materialAndCare: 1,
                    specifications: 1,
                    variants: 1,
                    createdAt: 1,
                },
            },
        ]);

        if (!bulkProducts || bulkProducts.length === 0) {
            return next(new AppError("Bulk product not found", 404));
        }

        res.status(200).json({
            success: true,
            data: bulkProducts[0],
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE
export const updateBulkProduct = async(req, res, next) => {
    try {
        const { id } = req.params;

        // Allowlist updatable fields (prevents mass assignment). The business
        // id is intentionally excluded so it can't be changed.
        const ALLOWED_FIELDS = [
            "title",
            "slug",
            "categoryId",
            "description",
            "uploadYourDesign",
            "anyText",
            "sizes",
            "colors",
            "quantities",
            "basePrice",
            "customizationTypes",
            "gsmQuantity",
            "status",
            "productDetails",
            "materialAndCare",
            "specifications",
        ];
        const updates = {};
        for (const key of ALLOWED_FIELDS) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        // CHECK PRODUCT
        const bulkProduct = await BulkProduct.findById(id);

        if (!bulkProduct) {
            return next(new AppError("Bulk product not found", 404));
        }

        // CHECK CATEGORY
        if (updates.categoryId) {
            const category = await Category.findById(
                updates.categoryId
            );

            if (!category) {
                return next(new AppError("Category not found", 404));
            }
        }

        // CHECK SLUG UNIQUE
        if (updates.slug) {
            const existingSlug = await BulkProduct.findOne({
                slug: updates.slug,
                _id: { $ne: id },
            });

            if (existingSlug) {
                return next(new AppError("Slug already exists", 400));
            }
        }

        Object.assign(bulkProduct, updates);

        await bulkProduct.save();

        res.status(200).json({
            success: true,
            message: "Bulk product updated successfully",
            data: bulkProduct,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE
export const deleteBulkProduct = async(req, res, next) => {
    try {

        const { id } = req.params;

        const bulkProduct = await BulkProduct.findById(id);

        if (!bulkProduct) {
            return next(
                new AppError("Bulk product not found", 404)
            );
        }

        // DELETE ALL RELATED VARIANTS
        await BulkProductVariant.deleteMany({
            bulkProductId: id,
        });

        // DELETE PRODUCT
        await BulkProduct.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Bulk product and related variants deleted successfully",
        });

    } catch (error) {

        next(error);
    }
};