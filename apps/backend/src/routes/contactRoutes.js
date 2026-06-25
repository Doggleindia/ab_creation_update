import express from 'express';
import {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js';
import { adminAuth  } from '../middleware/adminAuth.js';

const router = express.Router();

/**
 * ======================
 * USER ROUTES
 * ======================
 */
router.post('/', submitContact); 

/**
 * ======================
 * ADMIN ROUTES (PROTECTED)
 * ======================
 */
router.get('/', adminAuth , getAllContacts); 

router.patch('/:id/status', adminAuth , updateContactStatus); 

router.delete('/:id', adminAuth , deleteContact);


export default router;
