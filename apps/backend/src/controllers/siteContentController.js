import SiteContent from "../models/SiteContent.js";
import AppError from "../utils/AppError.js";
import { uploadFileToS3 } from "../config/s3Service.js";

/**
 * PUBLIC — the published storefront content. The web app merges this over
 * its built-in defaults, so an empty object is a valid response.
 */
export const getPublishedContent = async (req, res, next) => {
  try {
    const doc = await SiteContent.findOne({ key: "site" });
    res.status(200).json({
      status: "success",
      data: { content: doc?.published ?? {}, publishedAt: doc?.publishedAt ?? null },
    });
  } catch (err) {
    next(err);
  }
};

/** ADMIN — draft + published + timestamps for the editor. */
export const getAdminContent = async (req, res, next) => {
  try {
    const doc = await SiteContent.getSingleton();
    res.status(200).json({
      status: "success",
      data: {
        draft: doc.draft ?? {},
        published: doc.published ?? {},
        publishedAt: doc.publishedAt ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** ADMIN — replace the draft (the editor always sends the whole document). */
export const saveDraft = async (req, res, next) => {
  try {
    const content = req.body?.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return next(new AppError("content must be an object", 400));
    }
    const doc = await SiteContent.getSingleton();
    doc.draft = content;
    doc.markModified("draft");
    await doc.save();
    res.status(200).json({ status: "success", message: "Draft saved." });
  } catch (err) {
    next(err);
  }
};

/** ADMIN — publish the draft to the storefront. */
export const publishContent = async (req, res, next) => {
  try {
    const doc = await SiteContent.getSingleton();
    doc.published = doc.draft;
    doc.publishedAt = new Date();
    doc.markModified("published");
    await doc.save();
    res.status(200).json({
      status: "success",
      message: "All changes published — the storefront refreshes within a minute.",
      data: { publishedAt: doc.publishedAt },
    });
  } catch (err) {
    next(err);
  }
};

/** ADMIN — throw away draft edits and return to the published state. */
export const discardDraft = async (req, res, next) => {
  try {
    const doc = await SiteContent.getSingleton();
    doc.draft = doc.published ?? {};
    doc.markModified("draft");
    await doc.save();
    res.status(200).json({ status: "success", message: "Draft changes discarded." });
  } catch (err) {
    next(err);
  }
};

/** ADMIN — upload an image (hero media etc.), returns its S3 URL. */
export const uploadContentImage = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("No file uploaded", 400));
    if (!req.file.mimetype?.startsWith("image/")) {
      return next(new AppError("Only image files are allowed", 400));
    }
    const result = await uploadFileToS3(req.file);
    res.status(201).json({ status: "success", data: { url: result.Location } });
  } catch (err) {
    next(err);
  }
};
