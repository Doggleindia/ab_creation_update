import express from 'express';
import {
  uploadMedia,
  getAllMedia,
  updatePosition,
  deleteMedia,
  updateMediaDetails,
} from '../controllers/lookbookController.js';
import { upload } from "../middleware/uploadMiddleware.js";
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();


/**
 * PUBLIC ROUTES
 */
router.get('/', getAllMedia);

/**
 * ADMIN ROUTES (PROTECTED)
 */
router.post('/upload', adminAuth , upload.single('media'), uploadMedia);
router.get('/all', adminAuth , getAllMedia);
router.patch('/position', adminAuth , updatePosition);
router.patch('/:id/details', adminAuth , updateMediaDetails);
router.delete('/:id', adminAuth , deleteMedia);

export default router;
