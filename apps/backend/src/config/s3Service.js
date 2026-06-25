import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_S3_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_S3_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload file to S3
 * @param {Object} file - Multer file object
 * @returns {Object} S3 upload response
 */
export const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return await s3.upload(params).promise();
};

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Universal file upload to Cloudinary
 * @param {Express.Multer.File} file - Multer file object
 * @param {Object} options - Upload options (optional)
 * @param {string} options.folder - Target folder (default: 'misc')
 * @param {string} options.resource_type - Force 'image', 'video', 'raw', or 'auto' (default: auto-detected)
 * @returns {Promise<{ secure_url: string, public_id: string, resource_type: string }>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const { folder = 'misc', resource_type } = options;

  // Auto-detect resource type if not specified
  const detectedType = resource_type || getResourceType(file.mimetype);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: detectedType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type
        });
      }
    );
    uploadStream.end(file.buffer);
  });
};

// Helper: Detect resource type from MIME type
const getResourceType = (mime) => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'raw'; // PDFs are 'raw'
  return 'auto'; // Let Cloudinary decide
};