import express from "express";

import {
    createBulkProduct,
    getBulkProducts,
    getSingleBulkProduct,
    getBulkProductBySlug,
    updateBulkProduct,
    deleteBulkProduct,
    getPublicBulkProducts,
} from "../controllers/bulkProduct.controller.js";

import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// CREATE
router.post("/", adminAuth, createBulkProduct);

// GET ALL
router.get("/", getBulkProducts);

// PUBLIC: get bulk products with variants
router.get("/public", getPublicBulkProducts);

// GET BY SLUG WITH VARIANTS
router.get("/slug/:slug", getBulkProductBySlug);

// GET SINGLE BY ID
router.get("/:id", getSingleBulkProduct);

// UPDATE
router.put("/:id", adminAuth, updateBulkProduct);

// DELETE
router.delete("/:id", adminAuth, deleteBulkProduct);

export default router;