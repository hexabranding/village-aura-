import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';
import Image from '../models/Image.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');

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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function saveToMongoDB(file) {
  const filename = sanitizeFilename(file.originalname);
  const url = `/api/upload/images/${filename}`;
  const existing = await Image.findOne({ filename });
  if (existing) return url;
  await Image.create({
    filename,
    contentType: file.mimetype,
    data: file.buffer,
    size: file.size,
    url,
  });
  return url;
}

router.post('/', auth, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const urls = [];
    for (const file of req.files) {
      const url = await saveToMongoDB(file);
      urls.push(url);
    }
    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

router.post('/return', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    for (const f of req.files) {
      if (f.mimetype.startsWith('image/') && f.size > 8 * 1024 * 1024) return res.status(400).json({ error: `${f.originalname} exceeds 8MB` });
      if (f.mimetype.startsWith('video/') && f.size > 60 * 1024 * 1024) return res.status(400).json({ error: `${f.originalname} exceeds 60MB` });
    }
    const urls = [];
    for (const file of req.files) {
      const url = await saveToMongoDB(file);
      urls.push(url);
    }
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload' });
  }
});

router.get('/debug', async (req, res) => {
  try {
    const count = await Image.countDocuments();
    const sample = await Image.find().limit(20).select('filename size url contentType -data');
    res.json({ storage: 'mongodb', count, sample });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
