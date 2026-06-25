import multer from "multer";

// Store file in memory for S3
const storage = multer.memoryStorage();

// Only allow image and video uploads — blocks arbitrary file storage abuse
const fileFilter = (req, file, cb) => {
  if (/^(image|video)\//.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // allow up to 25MB per file
  });