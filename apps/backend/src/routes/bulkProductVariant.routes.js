import express from "express";

import {
    createBulkProductVariant,
    getVariantsByProduct,
    updateBulkProductVariant,
    getSingleVariantByProduct,
    deleteBulkProductVariant,
} from "../controllers/bulkProductVariant.controller.js";

import { upload } from "../middleware/uploadMiddleware.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// CREATE VARIANT
router.post(
    "/",
    adminAuth,
    upload.fields([{ name: "images", maxCount: 10 }]),
    createBulkProductVariant
);

// UPDATE VARIANT
router.put(
    "/:id",
    adminAuth,
    upload.fields([{ name: "images", maxCount: 10 }]),
    updateBulkProductVariant
);

// DELETE VARIANT
router.delete("/:id", adminAuth, deleteBulkProductVariant);

// GET ALL VARIANTS BY PRODUCT
router.get("/product/:productId", getVariantsByProduct);

// GET SINGLE VARIANT BY PRODUCT
router.get(
    "/product/:productId/variant/:variantId",
    getSingleVariantByProduct
);

export default router;