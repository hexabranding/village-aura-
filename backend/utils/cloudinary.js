import { v2 as cloudinary } from 'cloudinary';

// Cloudinary is the primary storage for every new upload (images + videos).
// When the credentials are missing the app falls back to MongoDB GridFS,
// so the backend keeps working in every environment.
//
// NOTE: configuration is resolved lazily on first use. ES modules evaluate
// imports before server.js runs `dotenv.config()`, so reading
// process.env at import time would always miss the values from .env.

let configuredCache = null;

export function cloudinaryConfigured() {
  if (configuredCache === null) {
    configuredCache = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    if (configuredCache) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
  }
  return configuredCache;
}

/**
 * Uploads an in-memory file buffer straight to Cloudinary.
 * resource_type 'auto' lets Cloudinary detect images AND videos (mp4/mov/webm).
 * Returns the Cloudinary result (result.secure_url is the public HTTPS URL).
 */
export function uploadBufferToCloudinary(buffer, options = {}) {
  if (!cloudinaryConfigured()) {
    return Promise.reject(new Error('Cloudinary is not configured (missing CLOUDINARY_* env vars)'));
  }
  const { folder = 'village-allure', publicId, overwrite = false } = options;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...(publicId ? { public_id: publicId, overwrite } : {}),
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message || JSON.stringify(error)}`));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}
