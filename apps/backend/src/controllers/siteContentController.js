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
    // Notification prefs are internal — strip them from the public payload.
    const { notifications, ...publicSettings } = doc?.settings ?? {};
    res.status(200).json({
      status: "success",
      data: {
        content: doc?.published ?? {},
        settings: publicSettings,
        publishedAt: doc?.publishedAt ?? null,
      },
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
        settings: doc.settings ?? {},
        settingsSavedAt: doc.settingsSavedAt ?? null,
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

/** ADMIN — save business settings directly (not draft-gated). */
export const saveSettings = async (req, res, next) => {
  try {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
      return next(new AppError("settings must be an object", 400));
    }
    const doc = await SiteContent.getSingleton();
    doc.settings = settings;
    doc.settingsSavedAt = new Date();
    doc.markModified("settings");
    await doc.save();
    res.status(200).json({
      status: "success",
      message: "Settings saved.",
      data: { settingsSavedAt: doc.settingsSavedAt },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Internal helper — is a notification type enabled? Defaults to true so
 * unset settings never silently drop emails.
 */
export const notificationEnabled = async (key) => {
  try {
    const doc = await SiteContent.findOne({ key: "site" }).select("settings");
    return doc?.settings?.notifications?.[key] !== false;
  } catch {
    return true;
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
