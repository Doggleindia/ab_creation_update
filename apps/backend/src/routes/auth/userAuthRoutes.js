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

import {
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../controllers/auth/addressController.js';
import { uploadAvatar, deleteAccount } from '../../controllers/auth/userController.js';
import { userAuth } from '../../middleware/userAuth.js';
import { authLimiter, otpLimiter, uploadLimiter } from '../../middleware/rateLimiters.js';
import { upload } from '../../middleware/uploadMiddleware.js';
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

/**
 * PUBLIC
 */
router.post("/signup", authLimiter, asyncHandler(signupUser));
router.post("/login", authLimiter, asyncHandler(loginUser));
router.post("/forgot-password", otpLimiter, asyncHandler(forgotPassword));
router.post("/validate-reset-code", authLimiter, asyncHandler(validateResetCode));
router.post("/reset-password", authLimiter, asyncHandler(resetPassword));

/**
 * PROTECTED
 */
router.post("/logout", userAuth, asyncHandler(logoutUser));
router.get("/profile", userAuth, asyncHandler(getUserProfile));
router.put("/profile", userAuth, asyncHandler(updateUserProfile));
router.post("/change-password", userAuth, asyncHandler(changePassword));
router.post(
  "/avatar",
  uploadLimiter,
  userAuth,
  upload.single("avatar"),
  asyncHandler(uploadAvatar),
);
router.delete("/account", authLimiter, userAuth, asyncHandler(deleteAccount));

// Address book (labeled, one default; default mirrors to user.address)
router.get("/addresses", userAuth, asyncHandler(listAddresses));
router.post("/addresses", userAuth, asyncHandler(addAddress));
router.put("/addresses/:id", userAuth, asyncHandler(updateAddress));
router.delete("/addresses/:id", userAuth, asyncHandler(deleteAddress));
router.patch("/addresses/:id/default", userAuth, asyncHandler(setDefaultAddress));

export default router;
