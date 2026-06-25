import express from "express";
import {
  createVariant,
  updateVariant,
  getProductVariants,
  getVariant,
  deleteVariant,
} from "../controllers/variantController.js";

import { upload } from "../middleware/uploadMiddleware.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/**
 * CREATE VARIANT
 */
router.post(
  "/products/:productId/variants",
  adminAuth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  createVariant
);

/**
 * GET ALL VARIANTS (ADMIN)
 */
router.get("/products/:productId/variants", getProductVariants);

/**
 * GET SINGLE VARIANT
 */
router.get("/products/:productId/variants/:variantId", getVariant);

/**
 * UPDATE VARIANT
 */
router.put(
  "/products/:productId/variants/:variantId",
  adminAuth,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 5 },
  ]),
  updateVariant
);

/**
 * DELETE VARIANT
 */
router.delete(
  "/products/:productId/variants/:variantId",
  adminAuth,
  deleteVariant
);
export default router;