import multer from "multer";

// Store file in memory for S3
const storage = multer.memoryStorage();

// Allow images/videos plus print-artwork vector formats (.pdf, .ai, .eps) —
// still blocks arbitrary file storage abuse.
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype || "";
  if (
    /^(image|video)\//.test(mime) ||
    mime === "application/pdf" ||
    mime === "application/postscript" ||
    mime === "application/illustrator"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image, video or print artwork (.pdf/.ai/.eps) files are allowed"), false);
  }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 }, // allow up to 25MB per file
  });