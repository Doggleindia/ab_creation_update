import express from 'express';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProduct,
    getAllProducts,
    getSingleProduct,
    getProductVariants
} from '../controllers/productController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin routes - require authentication
router.use('/admin', adminAuth);
router.post('/admin', createProduct);
router.get('/admin', getProducts);
router.get('/admin/:productId', getProduct);
router.put('/admin/:productId', updateProduct);
router.delete('/admin/:productId', deleteProduct);

// Public routes - no authentication required
router.get('/', getAllProducts);
router.get('/slug/:slug', getSingleProduct);
router.get('/:productId/variants', getProductVariants);

export default router;