import express from 'express';
import {
    createCategory,
    updateCategory,
    getCategories,
    getCategory,
    getAllCategories,
    deleteCategory,
} from "../controllers/categoryController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Admin routes - require authentication
router.use("/admin", adminAuth);
router.post("/admin", upload.single("image"), createCategory);
router.get("/admin", getCategories);
router.get("/admin/:id", getCategory);
router.put("/admin/:id", upload.single("image"), updateCategory);
router.delete("/admin/:id", deleteCategory);

// Public routes - no authentication required
router.get("/", getAllCategories);

export default router;