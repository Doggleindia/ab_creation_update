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
  sendQuote,
  getPublicQuote,
  respondToQuote,
  advanceQuoteStage,
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
router.get("/:id/quote", asyncHandler(getPublicQuote));
router.post("/:id/quote/respond", asyncHandler(respondToQuote));

/**
 * ADMIN — review queues and decisions.
 */
router.get("/", adminAuth, asyncHandler(getApplications));
router.get("/:id", adminAuth, asyncHandler(getApplication));
router.patch("/:id/approve", adminAuth, asyncHandler(approveApplication));
router.patch("/:id/reject", adminAuth, asyncHandler(rejectApplication));
router.patch("/:id/review", adminAuth, asyncHandler(updateApplicationReview));
router.patch("/:id/quote", adminAuth, asyncHandler(sendQuote));
router.patch("/:id/quote/stage", adminAuth, asyncHandler(advanceQuoteStage));

export default router;
