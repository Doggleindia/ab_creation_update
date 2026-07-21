import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import SellerProduct from "../models/SellerProduct.js";
import Product from "../models/Product.js";
import Variant from "../models/Variant.js";
import Inventory from "../models/Inventory.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { toStr } from "../utils/sanitize.js";

const requireSeller = (req, next) => {
  if (req.user?.accountType !== "seller") {
    next(new AppError("Only seller accounts can submit products", 403));
    return false;
  }
  return true;
};

/** SELLER — upload design/mockup images (max 5, images only). */
export const uploadSellerProductImages = async (req, res, next) => {
  if (!requireSeller(req, next)) return;
  const files = (req.files || []).filter((f) =>
    (f.mimetype || "").startsWith("image/"),
  );
  if (!files.length) return next(new AppError("No image files uploaded", 400));
  const urls = [];
  for (const file of files.slice(0, 5)) {
    const result = await uploadFileToS3(file);
    if (result?.Location) urls.push(result.Location);
  }
  res.status(200).json({ status: "success", data: { urls } });
};

/** SELLER — submit a product for review. */
export const createSellerProduct = async (req, res, next) => {
  if (!requireSeller(req, next)) return;
  const {
    title,
    description,
    baseProductId,
    method,
    color,
    retailPrice,
    sizes,
    tags,
    images,
  } = req.body;

  if (!title || !retailPrice) {
    return next(new AppError("title and retailPrice are required", 400));
  }

  let baseProduct = null;
  if (baseProductId && mongoose.isValidObjectId(baseProductId)) {
    baseProduct = await Product.findById(baseProductId);
  }

  const submission = await SellerProduct.create({
    sellerId: req.user._id,
    title: toStr(title),
    description: toStr(description),
    baseProductId: baseProduct?._id,
    baseProductName: baseProduct?.title ?? toStr(req.body.baseProductName),
    method: ["DTF", "Screen", "Embroidery", "Heat Transfer"].includes(method)
      ? method
      : "DTF",
    color: toStr(color) || "White",
    retailPrice: Number(retailPrice),
    sizes: Array.isArray(sizes) ? sizes.filter((s) => typeof s === "string").slice(0, 10) : [],
    tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string").slice(0, 10) : [],
    images: Array.isArray(images)
      ? images
          .filter(
            (u) =>
              typeof u === "string" &&
              (u.startsWith("http://") || u.startsWith("https://")),
          )
          .slice(0, 5)
      : [],
  });

  res.status(201).json({
    status: "success",
    message: "Design submitted for review. We'll notify you once it's checked.",
    data: { sellerProduct: { id: submission._id, status: submission.status } },
  });
};

/** SELLER — own submissions. */
export const getMySellerProducts = async (req, res, next) => {
  if (!requireSeller(req, next)) return;
  const products = await SellerProduct.find({ sellerId: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ status: "success", data: { sellerProducts: products } });
};

/** ADMIN — approvals queue. */
export const getAdminSellerProducts = async (req, res, next) => {
  const filter = {};
  const status = toStr(req.query.status);
  if (status) {
    if (!["pending", "approved", "rejected", "changes"].includes(status)) {
      return next(new AppError("Invalid status", 400));
    }
    filter.status = status;
  }
  const products = await SellerProduct.find(filter)
    .sort({ createdAt: -1 })
    .populate("sellerId", "name email")
    .populate("baseProductId", "title basePrice")
    .populate("publishedProductId", "slug");
  res.status(200).json({
    status: "success",
    results: products.length,
    data: { sellerProducts: products },
  });
};

const findSubmission = async (id, next) => {
  if (!mongoose.isValidObjectId(id)) {
    next(new AppError("Invalid submission id", 400));
    return null;
  }
  const submission = await SellerProduct.findById(id);
  if (!submission) {
    next(new AppError("Submission not found", 404));
    return null;
  }
  return submission;
};

/** ADMIN — persist review aids (notes/checklist). */
export const reviewSellerProduct = async (req, res, next) => {
  const submission = await findSubmission(req.params.id, next);
  if (!submission) return;
  if (typeof req.body.adminNotes === "string") {
    submission.adminNotes = req.body.adminNotes;
  }
  if (Array.isArray(req.body.checklist)) {
    submission.checklist = req.body.checklist
      .filter((x) => typeof x === "string")
      .slice(0, 20);
  }
  await submission.save();
  res.status(200).json({
    status: "success",
    data: {
      sellerProduct: {
        id: submission._id,
        adminNotes: submission.adminNotes,
        checklist: submission.checklist,
      },
    },
  });
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// Catalog ids are validated as PROD### / VAR### — allocate the next free code.
const nextCode = async (Model, prefix) => {
  const docs = await Model.find({}, "id").lean();
  let max = 0;
  for (const d of docs) {
    const m = new RegExp(`^${prefix}(\\d{3})$`).exec(d.id || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
};

/**
 * ADMIN — approve & publish: creates a real catalog Product + Variant +
 * Inventory so the design is immediately purchasable on the storefront.
 */
export const approveSellerProduct = async (req, res, next) => {
  const submission = await findSubmission(req.params.id, next);
  if (!submission) return;
  if (submission.status === "approved") {
    return next(new AppError("Submission already approved", 409));
  }

  const base = submission.baseProductId
    ? await Product.findById(submission.baseProductId)
    : null;
  if (!base) {
    return next(
      new AppError(
        "Submission has no base catalog product to publish from. Ask the seller to resubmit against a catalog garment.",
        400,
      ),
    );
  }

  const stamp = Date.now();
  const slug = `${slugify(submission.title)}-${String(stamp).slice(-5)}`;

  const product = await Product.create({
    id: await nextCode(Product, "PROD"),
    title: submission.title,
    categoryId: base.categoryId,
    basePrice: submission.retailPrice,
    discountPercentage: 0,
    description:
      submission.description ||
      `${submission.title} — a seller design printed on our ${base.title}.`,
    slug,
    // Must start as draft — the model blocks publishing before variants exist
    status: "draft",
    colors: [submission.color || "White"],
    sizes: submission.sizes.length ? submission.sizes : base.sizes,
    customizationTypes: [submission.method],
    specifications: base.specifications,
    materialAndCare: base.materialAndCare,
  });

  const color = submission.color || "White";
  const variant = await Variant.create({
    id: await nextCode(Variant, "VAR"),
    productId: product._id,
    color,
    // Same format the Variant pre-save generator uses (it runs after the
    // required-field validation, so we must supply the sku ourselves)
    sku: `SP-${color.replace(/\s+/g, "").slice(0, 3).toUpperCase()}-${Date.now()
      .toString()
      .slice(-4)}`,
    addPercentageInBasePrice: 0,
    media: { images: submission.images },
  });

  await Inventory.create({
    variantId: variant._id,
    stock: 100,
    reservedStock: 0,
  });

  product.status = "published";
  await product.save();

  submission.status = "approved";
  submission.reviewedBy = req.admin._id;
  submission.reviewedAt = new Date();
  submission.publishedProductId = product._id;
  await submission.save();

  res.status(200).json({
    status: "success",
    message: `Approved and published to the catalog as /product/${slug}.`,
    data: {
      sellerProduct: { id: submission._id, status: submission.status },
      product: { id: product._id, slug },
    },
  });
};

/** ADMIN — reject or request changes, with a reason. */
const closeWith = (status) => async (req, res, next) => {
  const submission = await findSubmission(req.params.id, next);
  if (!submission) return;
  if (submission.status === "approved") {
    return next(new AppError("Submission already approved", 409));
  }
  submission.status = status;
  submission.rejectionReason = toStr(req.body.reason);
  submission.reviewedBy = req.admin._id;
  submission.reviewedAt = new Date();
  await submission.save();
  res.status(200).json({
    status: "success",
    message:
      status === "rejected"
        ? "Submission rejected."
        : "Changes requested from the seller.",
    data: { sellerProduct: { id: submission._id, status: submission.status } },
  });
};

export const rejectSellerProduct = closeWith("rejected");
export const requestSellerProductChanges = closeWith("changes");
