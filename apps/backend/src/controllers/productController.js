import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Variant from '../models/Variant.js';
import Inventory from '../models/Inventory.js';
import SellerProduct from '../models/SellerProduct.js';
import AppError from '../utils/AppError.js';
import { safeRegexFilter, toStr } from '../utils/sanitize.js';

/**
 * ============================
 * CREATE PRODUCT (ADMIN)
 * ============================
 */
export const createProduct = async(req, res, next) => {
    try {
        const {
            id,
            title,
            categoryId,
            basePrice,
            customizationTypes,
            discountPercentage,
            description,
            seo,
            slug,
            sizes,
            colors,
            status = "draft",
            productDetails,
            materialAndCare,
            specifications,
            printZones,
            measurements,
        } = req.body;


        // ✅ Validate category
        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new AppError("Category not found", 400));
        }

        // ✅ Check unique product ID
        const exists = await Product.findOne({ id });
        if (exists) {
            return next(new AppError("Product ID already exists", 400));
        }

        const product = await Product.create({
            id,
            title,
            categoryId,
            basePrice,
            customizationTypes,
            discountPercentage,
            description,
            seo,
            slug,
            sizes,
            colors,
            status,
            productDetails,
            materialAndCare,
            specifications,
            printZones,
            measurements,
        });


        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * UPDATE PRODUCT (ADMIN)
 * ============================
 */
export const updateProduct = async(req, res, next) => {
    try {
        const { productId } = req.params;

        // Allowlist updatable fields — never pass the raw body to the DB, which
        // would let a client set arbitrary/internal fields (mass assignment).
        const ALLOWED_FIELDS = [
            "id",
            "title",
            "categoryId",
            "basePrice",
            "customizationTypes",
            "discountPercentage",
            "description",
            "seo",
            "slug",
            "sizes",
            "colors",
            "status",
            "productDetails",
            "materialAndCare",
            "specifications",
            "printZones",
            "measurements",
        ];
        const updates = {};
        for (const key of ALLOWED_FIELDS) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        // prevent change of business id
        if (updates.id) {
            const product = await Product.findById(productId);

            if (!product) {
                return next(new AppError("Product not found", 404));
            }

            if (updates.id !== product.id) {
                return next(new AppError("Product ID cannot be updated", 400));
            }
        }

        if (updates.categoryId) {
            const category = await Category.findById(updates.categoryId);
            if (!category) {
                return next(new AppError("Category not found", 400));
            }
        }

        if (updates.slug) {
            const existingSlug = await Product.findOne({
                slug: updates.slug,
                _id: { $ne: productId },
            });
            if (existingSlug) {
                return next(new AppError("Slug already exists", 400));
            }
        }

        const product = await Product.findByIdAndUpdate(
            productId,
            updates, { new: true, runValidators: true }
        ).populate("categoryId", "name slug");

        res.json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * DELETE PRODUCT (HARD DELETE 🔥)
 * ============================
 */
export const deleteProduct = async(req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) return next(new AppError("Product not found", 404));

        // Collect this product's variant ids first — inventory is keyed by
        // variantId, so deleting by productId left orphaned inventory docs.
        const variants = await Variant.find({ productId: product._id }).select("_id");
        const variantIds = variants.map((v) => v._id);

        // ✅ Delete inventory for those variants
        await Inventory.deleteMany({ variantId: { $in: variantIds } });

        // ✅ Delete variants
        await Variant.deleteMany({ productId: product._id });

        // ✅ Delete product permanently
        await Product.deleteOne({ _id: product._id });

        res.json({
            success: true,
            message: "Product permanently deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * GET PRODUCTS (ADMIN)
 * ============================
 */
export const getProducts = async(req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        const filter = {};

        if (status) filter.status = toStr(status);
        if (search) filter.title = safeRegexFilter(search);

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find(filter)
            .populate("categoryId", "name slug")
            .populate("variants", "id color sku media")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),

            Product.countDocuments(filter),
        ]);

        res.json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * GET SINGLE PRODUCT (ADMIN)
 * ============================
 */
export const getProduct = async(req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId)
            .populate("categoryId", "name slug")
            .lean();

        if (!product) return next(new AppError("Product not found", 404));

        const variantsCount = await Variant.countDocuments({
            productId: product._id,
        });

        res.json({
            success: true,
            data: {
                ...product,
                variantsCount,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * GET ALL PRODUCTS (PUBLIC)
 * ============================   
 */
export const getAllProducts = async(req, res, next) => {
    try {
        const {
            category,
            printMethod,
            size,
            color,
            priceRange,
            search,
            sort = "latest",
            page = 1,
            limit = 20,
        } = req.query;

        // =========================
        // BASE FILTER
        // =========================
        const filter = {
            status: "published",
        };

        // =========================
        // CATEGORY FILTER
        // =========================
        if (category) {
            const cat = await Category.findOne({ slug: category });

            if (!cat) {
                return res.json({
                    success: true,
                    message: "Products fetched successfully",
                    data: [],
                    meta: {
                        page: 1,
                        limit: Number(limit),
                        total: 0,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                });
            }

            filter.categoryId = cat._id;
        }

        // =========================
        // PRINT METHOD FILTER
        // =========================
        if (printMethod) {
            filter.customizationTypes = { $in: [toStr(printMethod)] };
        }

        // =========================
        // SIZE FILTER
        // =========================
        if (size) {
            filter.sizes = { $in: [toStr(size).toUpperCase()] };
        }

        // =========================
        // COLOR FILTER
        // =========================
        if (color) {
            filter.colors = { $in: [toStr(color)] };
        }

        // =========================
        // SEARCH FILTER
        // =========================
        if (search) {
            filter.title = safeRegexFilter(search);
        }

        // =========================
        // PRICE RANGE FILTER
        // =========================
        if (priceRange) {
            switch (priceRange) {
                case "0-500":
                    filter.basePrice = { $gte: 0, $lte: 500 };
                    break;

                case "500-1000":
                    filter.basePrice = { $gte: 500, $lte: 1000 };
                    break;

                case "1000-2000":
                    filter.basePrice = { $gte: 1000, $lte: 2000 };
                    break;

                case "2000+":
                    filter.basePrice = { $gte: 2000 };
                    break;
            }
        }

        // =========================
        // SORTING
        // =========================
        let sortOption = { createdAt: -1 };

        switch (sort) {
            case "priceLowToHigh":
                sortOption = { basePrice: 1 };
                break;

            case "priceHighToLow":
                sortOption = { basePrice: -1 };
                break;

            case "oldest":
                sortOption = { createdAt: 1 };
                break;

            case "latest":
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        // =========================
        // PAGINATION
        // =========================
        const currentPage = Number(page);
        const perPage = Number(limit);
        const skip = (currentPage - 1) * perPage;

        // =========================
        // AGGREGATION
        // =========================
        const products = await Product.aggregate([
            { $match: filter },

            // =========================
            // CATEGORY JOIN
            // =========================
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // =========================
            // COLLECTION JOIN (NEW)
            // =========================
            {
                $lookup: {
                    from: "collections",
                    localField: "category.collectionId",
                    foreignField: "_id",
                    as: "collection",
                },
            },
            {
                $unwind: {
                    path: "$collection",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // =========================
            // VARIANTS JOIN
            // =========================
            {
                $lookup: {
                    from: "variants",
                    localField: "_id",
                    foreignField: "productId",
                    as: "variants",
                },
            },

            // =========================
            // INVENTORY JOIN
            // =========================
            {
                $lookup: {
                    from: "inventories",
                    localField: "variants._id",
                    foreignField: "variantId",
                    as: "inventories",
                },
            },

            // =========================
            // ADD STOCK INFO
            // =========================
            {
                $addFields: {
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "v",
                            in: {
                                _id: "$$v._id",
                                id: "$$v.id",
                                sku: "$$v.sku",
                                size: "$$v.size",
                                color: "$$v.color",
                                price: "$$v.price",
                                media: "$$v.media",

                                availableStock: {
                                    $let: {
                                        vars: {
                                            inv: {
                                                $arrayElemAt: [{
                                                        $filter: {
                                                            input: "$inventories",
                                                            as: "i",
                                                            cond: {
                                                                $eq: ["$$i.variantId", "$$v._id"],
                                                            },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                        in: {
                                            $subtract: [
                                                { $ifNull: ["$$inv.stock", 0] },
                                                { $ifNull: ["$$inv.reservedStock", 0] },
                                            ],
                                        },
                                    },
                                },

                                isOutOfStock: {
                                    $lte: [{
                                            $let: {
                                                vars: {
                                                    inv: {
                                                        $arrayElemAt: [{
                                                                $filter: {
                                                                    input: "$inventories",
                                                                    as: "i",
                                                                    cond: {
                                                                        $eq: ["$$i.variantId", "$$v._id"],
                                                                    },
                                                                },
                                                            },
                                                            0,
                                                        ],
                                                    },
                                                },
                                                in: {
                                                    $subtract: [
                                                        { $ifNull: ["$$inv.stock", 0] },
                                                        { $ifNull: ["$$inv.reservedStock", 0] },
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            // =========================
            // SORT
            // =========================
            { $sort: sortOption },

            // =========================
            // PAGINATION
            // =========================
            { $skip: skip },
            { $limit: perPage },
        ]);

        // =========================
        // TOTAL COUNT
        // =========================
        const total = await Product.countDocuments(filter);

        // =========================
        // RESPONSE
        // =========================
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            meta: {
                page: currentPage,
                limit: perPage,
                total,
                totalPages: Math.ceil(total / perPage),
                hasNextPage: currentPage < Math.ceil(total / perPage),
                hasPrevPage: currentPage > 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * GET SINGLE PRODUCT (PUBLIC)
 * ============================
 */
export const getSingleProduct = async(req, res, next) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({
                slug,
                status: "published",
            }) // 🔥 isDeleted removed
            .populate("categoryId", "name slug")
            .lean();

        if (!product) return next(new AppError("Product not found", 404));

        // Count the view — fire-and-forget, never blocks the response
        Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).catch(() => {});

        // Seller attribution for marketplace products published from a
        // seller submission (null for AB Creation's own catalog).
        const sellerSub = await SellerProduct.findOne({
            publishedProductId: product._id,
            status: "approved",
        }).populate("sellerId", "name");

        const variants = await Variant.aggregate([
            { $match: { productId: product._id } },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "variantId",
                    as: "inventory",
                },
            },
            { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    availableStock: {
                        $subtract: ["$inventory.stock", "$inventory.reservedStock"],
                    },
                },
            },
            { $match: { availableStock: { $gt: 0 } } },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    size: 1,
                    color: 1,
                    price: 1,
                    media: 1,
                    availableStock: 1,
                    addPercentageInBasePrice: 1,
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                _id: product._id,
                id: product.id,
                title: product.title,
                basePrice: product.basePrice,
                discountPercentage: product.discountPercentage,
                description: product.description,
                seo: product.seo,
                slug: product.slug,
                sizes: product.sizes,
                colors: product.colors,
                category: product.categoryId,
                productDetails: product.productDetails,
                materialAndCare: product.materialAndCare,
                specifications: product.specifications,
                customizationTypes: product.customizationTypes,
                printZones: product.printZones,
                measurements: product.measurements,
                seller: sellerSub?.sellerId?.name
                    ? { name: sellerSub.sellerId.name }
                    : null,
                variants,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * ============================
 * GET PRODUCT VARIANTS (PUBLIC)
 * ============================
 */
export const getProductVariants = async(req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            status: "published",
        });

        if (!product) {
            return next(new AppError("Product not found", 404));
        }

        const variants = await Variant.aggregate([
            { $match: { productId: product._id } },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "variantId",
                    as: "inventory",
                },
            },
            { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    availableStock: {
                        $subtract: ["$inventory.stock", "$inventory.reservedStock"],
                    },
                },
            },
            { $match: { availableStock: { $gt: 0 } } },
        ]);

        res.json({
            success: true,
            data: variants,
        });
    } catch (err) {
        next(err);
    }
};