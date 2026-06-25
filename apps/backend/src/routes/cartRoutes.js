import express from "express";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    getAllCarts,
} from "../controllers/CartController.js";
import { userAuth } from "../middleware/userAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/", userAuth, addToCart); // Add to cart
router.get("/", userAuth, getCart); // Get user cart
router.put("/", userAuth, updateCartItem); // Update cart item
router.delete("/:cartItemId", userAuth, removeFromCart); // Remove item

// ================= ADMIN CART ROUTES =================
router.get("/admin/all", adminAuth, getAllCarts);

export default router;