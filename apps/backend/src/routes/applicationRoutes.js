import express from "express";
import {
  submitBulkApplication,
  submitSellerApplication,
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
} from "../controllers/applicationController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * PUBLIC — application intake. The type is fixed by the endpoint so a form can
 * only ever create its own kind of application.
 */
router.post("/bulk", asyncHandler(submitBulkApplication));
router.post("/seller", asyncHandler(submitSellerApplication));

/**
 * ADMIN — review queues and decisions.
 */
router.get("/", adminAuth, asyncHandler(getApplications));
router.get("/:id", adminAuth, asyncHandler(getApplication));
router.patch("/:id/approve", adminAuth, asyncHandler(approveApplication));
router.patch("/:id/reject", adminAuth, asyncHandler(rejectApplication));

export default router;
