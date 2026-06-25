import Collection from "../models/Collection.js";
import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";
import { safeRegexFilter, toStr } from "../utils/sanitize.js";

// Create Collection
export const createCollection = async (req, res, next) => {
  try {
    const { id, name, slug, status } = req.body;

    // Validate name is in allowed enum
    const allowedNames = [
      "MENS-COLLECTIONS",
      "WOMENS-COLLECTIONS",
      "KIDS-COLLECTIONS",
    ];
    if (!allowedNames.includes(name.toUpperCase())) {
      return next(
        new AppError(
          `Collection name must be one of: ${allowedNames.join(", ")}`,
          400,
        ),
      );
    }

    const existingCollection = await Collection.findOne({
      $or: [{ id }, { slug }],
    });
    if (existingCollection) {
      return next(new AppError("Collection ID or slug already exists", 400));
    }

    const collection = await Collection.create({
      id,
      name: name.toUpperCase(),
      slug: slug.toLowerCase(),
      status,
    });

    res.status(201).json({
      status: "success",
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
};

// Get All Collections (Admin)
export const getCollections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: safeRegexFilter(search) },
        { slug: safeRegexFilter(search) },
        { id: safeRegexFilter(search) },
      ];
    }

    if (status) {
      filter.status = toStr(status);
    }

    const collections = await Collection.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Collection.countDocuments(filter);

    res.status(200).json({
      status: "success",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      results: collections.length,
      data: { collections },
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Collection
export const getCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findOne({ id });

    if (!collection) {
      return next(new AppError("Collection not found", 404));
    }

    // Get categories tagged to this collection
    const categories = await Category.find({
      collectionId: collection._id,
    }).select("id name slug status");

    res.status(200).json({
      status: "success",
      data: {
        collection,
        categoriesCount: categories.length,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update Collection
export const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.body.id && req.body.id !== id) {
      return next(new AppError("Cannot update collection ID", 400));
    }

    // Allowlist updatable fields (prevents mass assignment)
    const updates = {};
    for (const key of ["name", "slug", "status"]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const collection = await Collection.findOne({ id });
    if (!collection) {
      return next(new AppError("Collection not found", 404));
    }

    // Validate name if being updated
    if (updates.name) {
      const allowedNames = [
        "MENS-COLLECTIONS",
        "WOMENS-COLLECTIONS",
        "KIDS-COLLECTIONS",
      ];
      if (!allowedNames.includes(updates.name.toUpperCase())) {
        return next(
          new AppError(
            `Collection name must be one of: ${allowedNames.join(", ")}`,
            400,
          ),
        );
      }
      updates.name = updates.name.toUpperCase();
    }

    if (updates.slug) {
      updates.slug = updates.slug.toLowerCase();
    }

    const updatedCollection = await Collection.findOneAndUpdate(
      { id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: "success",
      data: { collection: updatedCollection },
    });
  } catch (error) {
    next(error);
  }
};

// Toggle Collection Status
export const toggleCollectionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findOne({ id });

    if (!collection) {
      return next(new AppError("Collection not found", 404));
    }

    collection.status = collection.status === "active" ? "inactive" : "active";
    await collection.save();

    res.status(200).json({
      status: "success",
      message: `Collection ${collection.status === "active" ? "activated" : "disabled"} successfully`,
      data: {
        collection,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete Collection
export const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const collection = await Collection.findOne({ id });
    if (!collection) {
      return next(new AppError("Collection not found", 404));
    }

    // Check if any categories are using this collection
    const categoryCount = await Category.countDocuments({
      collectionId: collection._id,
    });

    if (categoryCount > 0) {
      return next(
        new AppError("Cannot delete collection with tagged categories", 400),
      );
    }

    await Collection.deleteOne({ id });

    res.status(200).json({
      status: "success",
      message: "Collection deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get All Collections (Public)
export const getAllCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ status: "active" })
      .select("id name slug")
      .sort({ name: 1 });

    res.status(200).json({
      status: "success",
      results: collections.length,
      data: { collections },
    });
  } catch (error) {
    next(error);
  }
};
