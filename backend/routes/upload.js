import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import auth from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadDir = path.join(
  process.env.HOME,
  'domains',
  'api.villageallure.com',
  'uploads'
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/mov'];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ['.jpg','.jpeg','.png','.webp','.gif','.mp4','.mov','.webm','.ogg'];
    if(allowedExt.includes(ext) || allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG/PNG/WebP and MP4/MOV allowed'), false);
  } else {
    cb(new Error('Only JPG/PNG/WebP and MP4/MOV allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/', auth, upload.array('images', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const urls = req.files.map((file) => `/api/upload/images/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

router.post('/return', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    for(const f of req.files){
      if(f.mimetype.startsWith('image/') && f.size > 8*1024*1024) return res.status(400).json({ error: `${f.originalname} exceeds 8MB` });
      if(f.mimetype.startsWith('video/') && f.size > 60*1024*1024) return res.status(400).json({ error: `${f.originalname} exceeds 60MB` });
    }
    const urls = req.files.map((file) => `/api/upload/images/${file.filename}`);
    res.json({ urls });
  } catch (error) { res.status(500).json({ error: 'Failed to upload' }); }
});

router.get('/images/:filename', (req, res) => {
const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found', filename: req.params.filename });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=2592000');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('sendFile error:', err);
      if (!res.headersSent) res.status(404).json({ error: 'File not found' });
    }
  });
});

router.get('/debug', (req, res) => {
  const dir = path.join(__dirname, '../uploads');
  try {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    res.json({ dir, exists: fs.existsSync(dir), count: files.length, sample: files.slice(0, 10) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
