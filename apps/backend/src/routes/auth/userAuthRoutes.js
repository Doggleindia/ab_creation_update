import express from 'express';
import {
  signupUser,
  loginUser,
  forgotPassword,
  validateResetCode,
  resetPassword,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../../controllers/auth/userController.js';

import { userAuth } from '../../middleware/userAuth.js';
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

/**
 * PUBLIC
 */
router.post("/signup", asyncHandler(signupUser));
router.post("/login", asyncHandler(loginUser));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/validate-reset-code", asyncHandler(validateResetCode));
router.post("/reset-password", asyncHandler(resetPassword));

/**
 * PROTECTED
 */
router.post("/logout", userAuth, asyncHandler(logoutUser));
router.get("/profile", userAuth, asyncHandler(getUserProfile));
router.put("/profile", userAuth, asyncHandler(updateUserProfile));
router.post("/change-password", userAuth, asyncHandler(changePassword));

export default router;
