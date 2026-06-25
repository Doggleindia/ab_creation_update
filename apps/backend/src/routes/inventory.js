import express from "express";
import {
  updateInventory,
  getVariantInventory,
   getProductInventory,
} from "../controllers/inventoryController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// All routes require authentication
router.use(adminAuth);

// ✅ Update inventory
router.put(
  "/products/:productId/variants/:variantId/inventory",
  updateInventory
);


// ✅ Get inventory
router.get(
  "/products/:productId/variants/:variantId/inventory",
  getVariantInventory
);

router.get("/products/:productId/inventory", getProductInventory);

export default router;
