import express from 'express';
import {
  signupAdmin,
  loginAdmin,
  forgotPassword,
  validateResetCode,
  resetPassword,
  getAllAdmins,
  deleteAdmin,
  getAllUsers,
  logoutAdmin,
  changeAdminPassword,
} from "../../controllers/auth/adminController.js";

import { adminAuth, optionalAdminAuth } from '../../middleware/adminAuth.js';

const router = express.Router();

/**
 * PUBLIC
 */
// Signup is gated in the controller: only the first admin can bootstrap without
// auth; afterwards a valid admin token is required to create another admin.
router.post('/signup', optionalAdminAuth, signupAdmin);
router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-code', validateResetCode);
router.post('/reset-password', resetPassword);

/**
 * PROTECTED
 */
router.get('/', adminAuth, getAllAdmins);         
router.delete('/:adminId', adminAuth, deleteAdmin);
router.post("/logout", adminAuth, logoutAdmin);
router.post("/change-password", adminAuth, changeAdminPassword);
router.get("/users/all", adminAuth, getAllUsers);

export default router;
