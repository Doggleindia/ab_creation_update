import express from "express";
import {
  uploadSellerProductImages,
  createSellerProduct,
  getMySellerProducts,
  deleteMySellerProduct,
  getAdminSellerProducts,
  reviewSellerProduct,
  approveSellerProduct,
  rejectSellerProduct,
  requestSellerProductChanges,
  resubmitSellerProduct,
} from "../controllers/sellerProductController.js";
import { userAuth } from "../middleware/userAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// Seller (requires a seller account)
router.post(
  "/upload",
  uploadLimiter,
  userAuth,
  upload.array("images", 5),
  asyncHandler(uploadSellerProductImages),
);
router.post("/", userAuth, asyncHandler(createSellerProduct));
router.get("/mine", userAuth, asyncHandler(getMySellerProducts));
router.patch("/:id/resubmit", userAuth, asyncHandler(resubmitSellerProduct));
router.delete("/:id", userAuth, asyncHandler(deleteMySellerProduct));

// Admin approvals queue
router.get("/admin", adminAuth, asyncHandler(getAdminSellerProducts));
router.patch("/admin/:id/review", adminAuth, asyncHandler(reviewSellerProduct));
router.patch("/admin/:id/approve", adminAuth, asyncHandler(approveSellerProduct));
router.patch("/admin/:id/reject", adminAuth, asyncHandler(rejectSellerProduct));
router.patch(
  "/admin/:id/changes",
  adminAuth,
  asyncHandler(requestSellerProductChanges),
);

export default router;
