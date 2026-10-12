import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import Image from '../models/Image.js';
import { saveToGridFS, findGridFSFile } from '../utils/gridfs.js';
import { cloudinaryConfigured, uploadBufferToCloudinary } from '../utils/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
export const uploadDir = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

function sanitizeFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const base = path.basename(originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 80);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  return `${uniqueSuffix}_${base || 'file'}${ext}`;
}

// Files are buffered in memory then written straight to MongoDB (GridFS).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.webm', '.ogg'];
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${ext}. Allowed: ${allowedExt.join(', ')}`), false);
  }
};

const MB = 1024 * 1024;
const MAX_ADMIN_FILE_SIZE = 50 * MB; // matches the "Max 50MB" hint in the admin UI
const MAX_RETURN_FILE_SIZE = 60 * MB; // return evidence videos can be large

function handleUpload(limit, maxFileSize) {
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize },
  });
  return (req, res, next) => {
    upload.array('images', limit)(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: `File too large. Max size is ${Math.floor(maxFileSize / MB)}MB per file.` });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: `Too many files. Max is ${limit} per upload.` });
      }
      if (err.message) {
        return res.status(400).json({ error: err.message });
      }
      console.error('Multer error:', err);
      res.status(500).json({ error: 'Upload failed' });
    });
  };
}

// Stores a buffered file in MongoDB (GridFS) and returns its public URL.
async function saveFileToMongo(file) {
  const filename = sanitizeFilename(file.originalname);
  const existing = await findGridFSFile(filename);
  if (existing) return `/api/upload/images/${filename}`;
  await saveToGridFS(filename, file.buffer, file.mimetype);
  return `/api/upload/images/${filename}`;
}

// Last-resort storage: local disk. The image route in server.js serves these
// files directly, so an upload can never be lost just because an upstream
// storage (Cloudinary / MongoDB) is unavailable.
function saveFileToDisk(file) {
  const filename = sanitizeFilename(file.originalname);
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return `/api/upload/images/${filename}`;
}

// New uploads go to Cloudinary (keeps files out of the MongoDB quota).
// Falls back to GridFS, then local disk, so uploads always succeed.
async function saveFile(file) {
  if (cloudinaryConfigured()) {
    try {
      const result = await uploadBufferToCloudinary(file.buffer);
      return result.secure_url;
    } catch (error) {
      console.warn(`Cloudinary upload failed (${error.message}) — falling back to local disk.`);
    }
  }
  try {
    return await saveFileToMongo(file);
  } catch (error) {
    console.warn(`GridFS upload failed (${error.message}) — falling back to local disk.`);
    return saveFileToDisk(file);
  }
}

router.post('/', auth, handleUpload(20, MAX_ADMIN_FILE_SIZE), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const urls = [];
    for (const file of req.files) {
      urls.push(await saveFile(file));
    }
    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload images' });
  }
});

router.post('/return', handleUpload(10, MAX_RETURN_FILE_SIZE), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    for (const f of req.files) {
      if (f.mimetype.startsWith('image/') && f.size > 8 * MB) return res.status(400).json({ error: `${f.originalname} exceeds 8MB` });
      if (f.mimetype.startsWith('video/') && f.size > 60 * MB) return res.status(400).json({ error: `${f.originalname} exceeds 60MB` });
    }
    const urls = [];
    for (const file of req.files) {
      urls.push(await saveFile(file));
    }
    res.json({ urls });
  } catch (error) {
    console.error('Return upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload' });
  }
});

router.get('/debug', async (req, res) => {
  try {
    const diskFiles = fs.readdirSync(uploadDir).length;
    let mongoCount = 0;
    let gridFsCount = 0;
    try {
      mongoCount = await Image.countDocuments();
    } catch {
      mongoCount = -1;
    }
    try {
      gridFsCount = await mongoose.connection.db.collection('uploads.files').countDocuments();
    } catch {
      gridFsCount = -1;
    }
    res.json({
      storage: cloudinaryConfigured() ? 'cloudinary' : 'mongodb-gridfs',
      cloudinary: cloudinaryConfigured(),
      gridFsCount,
      legacyImageCount: mongoCount,
      diskFiles,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
