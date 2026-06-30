import express from "express";
import {
  buyNow,
  checkoutCart,
  getUserOrderHistory,
  getAdminUserOrderHistory,
  getAdminAllOrders,
  getOrderById,
  uploadDesigns,
} from "../controllers/orderController.js";
import { userAuth } from "../middleware/userAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// User Routes — purchases require login (wallet payment), no guest checkout
router.post("/upload-designs", userAuth, upload.array("designs", 10), uploadDesigns);
router.post("/buynow", userAuth, buyNow);
router.post("/checkout", userAuth, checkoutCart); // atomic multi-item cart checkout
router.get("/history", userAuth, getUserOrderHistory);
router.get("/:orderId", userAuth, getOrderById);

// Admin Routes
router.get("/admin/all", adminAuth, getAdminAllOrders);
router.get("/admin/user/:userId", adminAuth, getAdminUserOrderHistory);

export default router;
