import express from 'express';
import {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  toggleCollectionStatus,
  deleteCollection,
  getAllCollections,
} from "../controllers/collectionController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin routes - require authentication
router.use("/admin", adminAuth);
router.post("/admin", createCollection);
router.get("/admin", getCollections);
router.get("/admin/:id", getCollection);
router.put("/admin/:id", updateCollection);
router.patch("/admin/:id/status", toggleCollectionStatus);
router.delete("/admin/:id", deleteCollection);

// Public routes - no authentication required
router.get("/", getAllCollections);

export default router;
