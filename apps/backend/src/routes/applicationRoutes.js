import express from "express";
import {
  submitBulkApplication,
  submitSellerApplication,
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  uploadPortfolio,
  updateApplicationReview,
} from "../controllers/applicationController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * PUBLIC — application intake. The type is fixed by the endpoint so a form can
 * only ever create its own kind of application.
 */
router.post("/bulk", asyncHandler(submitBulkApplication));
router.post("/seller", asyncHandler(submitSellerApplication));
router.post(
  "/upload-portfolio",
  upload.array("designs", 5),
  asyncHandler(uploadPortfolio),
);

/**
 * ADMIN — review queues and decisions.
 */
router.get("/", adminAuth, asyncHandler(getApplications));
router.get("/:id", adminAuth, asyncHandler(getApplication));
router.patch("/:id/approve", adminAuth, asyncHandler(approveApplication));
router.patch("/:id/reject", adminAuth, asyncHandler(rejectApplication));
router.patch("/:id/review", adminAuth, asyncHandler(updateApplicationReview));

export default router;
