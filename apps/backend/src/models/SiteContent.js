import mongoose from "mongoose";

/**
 * Single-document CMS store for storefront content. `draft` is what the
 * admin edits; `published` is what the storefront serves. Publishing copies
 * draft -> published; discarding copies published -> draft.
 */
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    draft: { type: mongoose.Schema.Types.Mixed, default: {} },
    published: { type: mongoose.Schema.Types.Mixed, default: {} },
    publishedAt: { type: Date },
    // Business settings (info, branding, socials, notifications, language) —
    // saved directly, not draft-gated like homepage content.
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    settingsSavedAt: { type: Date },
  },
  { timestamps: true },
);

siteContentSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: "site" });
  if (!doc) doc = await this.create({ key: "site" });
  return doc;
};

export default mongoose.model("SiteContent", siteContentSchema);
