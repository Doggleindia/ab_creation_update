import express from "express";
import {
  getPublishedContent,
  getAdminContent,
  saveDraft,
  publishContent,
  discardDraft,
  uploadContentImage,
  saveSettings,
} from "../controllers/siteContentController.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public — consumed by the storefront
router.get("/", getPublishedContent);

// Admin editor
router.get("/admin", adminAuth, getAdminContent);
router.put("/admin/draft", adminAuth, saveDraft);
router.post("/admin/publish", adminAuth, publishContent);
router.post("/admin/discard", adminAuth, discardDraft);
router.patch("/admin/settings", adminAuth, saveSettings);
router.post("/admin/upload", adminAuth, upload.single("image"), uploadContentImage);

export default router;
