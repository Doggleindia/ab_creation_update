import express from "express";
import {
  submitBulkApplication,
  submitSellerApplication,
  getApplications,
  getApplication,
  getMyApplications,
  approveApplication,
  rejectApplication,
  uploadPortfolio,
  updateApplicationReview,
  sendQuote,
  getPublicQuote,
  respondToQuote,
  payQuoteAdvance,
  advanceQuoteStage,
} from "../controllers/applicationController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { userAuth } from "../middleware/userAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { intakeLimiter, uploadLimiter } from "../middleware/rateLimiters.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * PUBLIC — application intake. The type is fixed by the endpoint so a form can
 * only ever create its own kind of application.
 */
router.post("/bulk", intakeLimiter, asyncHandler(submitBulkApplication));
router.post("/seller", intakeLimiter, asyncHandler(submitSellerApplication));
// Rate limit BEFORE multer — unauthenticated S3 uploads must be bounded
router.post(
  "/upload-portfolio",
  uploadLimiter,
  upload.array("designs", 5),
  asyncHandler(uploadPortfolio),
);
// Logged-in bulk buyers: their own applications for the dashboard.
// Registered before /:id/quote so "mine" never matches as an id.
router.get("/mine", userAuth, asyncHandler(getMyApplications));
router.get("/:id/quote", asyncHandler(getPublicQuote));
router.post("/:id/quote/respond", intakeLimiter, asyncHandler(respondToQuote));
// Accept + pay the advance from the wallet (linked bulk account only)
router.post("/:id/quote/pay-advance", userAuth, asyncHandler(payQuoteAdvance));

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
