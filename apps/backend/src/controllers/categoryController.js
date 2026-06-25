import Category from "../models/Category.js";
import Collection from "../models/Collection.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { deleteFileFromS3ByUrl } from "../config/deleteFileFromS3ByUrl.js";
import { safeRegexFilter, toStr } from "../utils/sanitize.js";

// Create Category
export const createCategory = async(req, res, next) => {
    try {
        const { id, name, slug, collectionId, images } = req.body;
        const file = req.file;

        const existingCategory = await Category.findOne({
            $or: [{ id }, { slug }],
        });
        if (existingCategory) {
            return next(new AppError("Category ID or slug already exists", 400));
        }

        // Validate collection if provided
        let finalCollectionId = null;
        if (collectionId) {
            const collection = await Collection.findById(collectionId);
            if (!collection) {
                return next(new AppError("Collection not found", 400));
            }
            finalCollectionId = collectionId;
        }

        const categoryData = {
            id,
            name,
            slug,
            collectionId: finalCollectionId,
        };

        if (images && Array.isArray(images)) {
            categoryData.images = images;
        } else if (images && typeof images === "string") {
            categoryData.images = [images];
        }

        if (file) {
            const uploadResult = await uploadFileToS3(file);
            if (!categoryData.images) {
                categoryData.images = [];
            }
            categoryData.images.push(uploadResult.Location);
        }

        const category = await Category.create(categoryData);

        res.status(201).json({
            status: "success",
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// Update Category
export const updateCategory = async(req, res, next) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (req.body.id && req.body.id !== id) {
            return next(new AppError("Cannot update category ID", 400));
        }

        // Allowlist updatable fields (prevents mass assignment)
        const updates = {};
        for (const key of ["name", "slug", "collectionId", "status", "images"]) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const category = await Category.findOne({ id });
        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        // Validate collection if being updated
        if (updates.collectionId) {
            const collection = await Collection.findById(updates.collectionId);
            if (!collection) {
                return next(new AppError("Collection not found", 400));
            }
        } else if (updates.collectionId === "") {
            updates.collectionId = null;
        }

        // Handle image upload if file is provided
        if (file) {
            const uploadResult = await uploadFileToS3(file);
            if (!updates.images) {
                updates.images = [];
            } else if (typeof updates.images === "string") {
                updates.images = [updates.images];
            }
            updates.images.push(uploadResult.Location);
        }

        if (updates.images && typeof updates.images === "string") {
            updates.images = [updates.images];
        }

        const updatedCategory = await Category.findOneAndUpdate({ id }, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            status: "success",
            data: { category: updatedCategory },
        });
    } catch (error) {
        next(error);
    }
};

// Toggle Category Status (active <-> inactive)
export const toggleCategoryStatus = async(req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({ id });

        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        // Toggle status
        category.status = category.status === "active" ? "inactive" : "active";
        await category.save();

        res.status(200).json({
            status: "success",
            message: `Category ${category.status === "active" ? "activated" : "disabled"} successfully`,
            data: {
                category,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get All Categories (Admin) with Pagination + Search
export const getCategories = async(req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, slug } = req.query;

        let filter = {};

        // Search by name, slug, or id (regex-escaped to prevent injection/ReDoS)
        if (search) {
            filter.$or = [
                { name: safeRegexFilter(search) },
                { slug: safeRegexFilter(search) },
                { id: safeRegexFilter(search) },
            ];
        }

        // Filter by slug
        if (slug) {
            filter.slug = toStr(slug);
        }

        const categories = await Category.find(filter)
            .populate("collectionId", "id name slug")
            .populate("productsCount")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Category.countDocuments(filter);

        res.status(200).json({
            status: "success",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            results: categories.length,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};

// Get Single Category
export const getCategory = async(req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findOne({ id })
            .populate("collectionId", "id name slug")
            .populate("productsCount");

        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        res.status(200).json({
            status: "success",
            data: { category },
        });
    } catch (error) {
        next(error);
    }
};

// Safe Delete Category
export const deleteCategory = async(req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({ id });
        if (!category) {
            return next(new AppError("Category not found", 404));
        }

        const productCount = await Product.countDocuments({
            categoryId: category._id,
        });

        if (productCount > 0) {
            return next(
                new AppError("Cannot delete category with existing products", 400),
            );
        }

        await Category.deleteOne({ id });

        res.status(200).json({
            status: "success",
            message: "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Get All Categories (Public)
export const getAllCategories = async(req, res, next) => {
    try {
        const categories = await Category.find()
            .select("id name slug images collectionId")
            .populate("collectionId", "id name slug")
            .sort({ name: 1 });

        res.status(200).json({
            status: "success",
            results: categories.length,
            data: { categories },
        });
    } catch (error) {
        next(error);
    }
};