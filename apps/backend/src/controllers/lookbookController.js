import Lookbook from "../models/lookbookModel.js";
import { uploadFileToS3 } from "../config/s3Service.js";
import { deleteFileFromS3ByUrl } from "../config/deleteFileFromS3ByUrl.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

/**
 * ======================
 * UPLOAD MEDIA (ADMIN)
 * ======================
 */
export const uploadMedia = async (req, res, next) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!file) {
      return next(new AppError("No file uploaded", 400));
    }

    // Upload to S3
    const uploadResult = await uploadFileToS3(file);

    // Determine media type
    const mediaType = file.mimetype.startsWith("image/") ? "image" : "video";

    // Get the next position
    const lastItem = await Lookbook.findOne().sort({ position: -1 });
    const nextPosition = lastItem ? lastItem.position + 1 : 1;

    // Create Lookbook entry
    const lookbookItem = await Lookbook.create({
      title,
      mediaUrl: uploadResult.Location,
      mediaType,
      publicId: uploadResult.Key, // use S3 key as publicId
      position: nextPosition,
    });

    res.status(201).json({
      status: "success",
      data: { lookbookItem },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * GET ALL MEDIA (PUBLIC)
 * ======================
 */
export const getAllMedia = async (req, res, next) => {
  try {
    const lookbookItems = await Lookbook.find().sort({ position: 1 });

    res.status(200).json({
      status: "success",
      results: lookbookItems.length,
      data: { lookbookItems },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * UPDATE POSITION (ADMIN)
 * ======================
 */
export const updatePosition = async (req, res, next) => {
  try {
    const updates = req.body;

    const tempOps = updates.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { position: -(index + 1) },
      },
    }));

    await Lookbook.bulkWrite(tempOps);

    const finalOps = updates.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { position: item.position },
      },
    }));

    await Lookbook.bulkWrite(finalOps);

    res.status(200).json({
      status: "success",
      message: "Positions updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * DELETE MEDIA (ADMIN)
 * ======================
 */
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Lookbook.findById(id);
    if (!item) {
      return next(new AppError("Lookbook item not found", 404));
    }

    // Delete file from S3 using publicId (S3 Key)
    await deleteFileFromS3ByUrl(item.mediaUrl);

    // Remove from DB
    await Lookbook.findByIdAndDelete(id);

    // Reorder positions
    await Lookbook.updateMany(
      { position: { $gt: item.position } },
      { $inc: { position: -1 } },
    );

    res.status(200).json({
      status: "success",
      message: "Media deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ======================
 * UPDATE MEDIA DETAILS (ADMIN)
 * ======================
 */
export const updateMediaDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const item = await Lookbook.findByIdAndUpdate(
      id,
      { title },
      { new: true, runValidators: true },
    );

    if (!item) {
      return next(new AppError("Lookbook item not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: { lookbookItem: item },
    });
  } catch (err) {
    next(err);
  }
};
