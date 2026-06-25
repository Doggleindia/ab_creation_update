import express from "express";
import {
  buyNow,
  getUserOrderHistory,
  getAdminUserOrderHistory,
  getAdminAllOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { userAuth } from "../middleware/userAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// User Routes — purchases require login (wallet payment), no guest checkout
router.post("/buynow", userAuth, buyNow);
router.get("/history", userAuth, getUserOrderHistory);
router.get("/:orderId", userAuth, getOrderById);

// Admin Routes
router.get("/admin/all", adminAuth, getAdminAllOrders);
router.get("/admin/user/:userId", adminAuth, getAdminUserOrderHistory);

export default router;
