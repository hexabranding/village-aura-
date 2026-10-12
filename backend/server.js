import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '.env') });

const _envCheck = () => {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  console.log('Razorpay Key:', key ? `${key.substring(0, 12)}...` : 'MISSING');
  console.log('Razorpay Secret:', secret ? 'set' : 'MISSING');
  console.log('Image Storage: MongoDB GridFS (legacy MongoDB + disk fallbacks)');
};

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import Image from './models/Image.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import adRoutes from './routes/ads.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes, { uploadDir } from './routes/upload.js';
import galleryRoutes from './routes/gallery.js';
import watchShopRoutes from './routes/watchshop.js';
import testimonialRoutes from './routes/testimonials.js';
import weaverStoryRoutes from './routes/weaverStory.js';
import curatedEditRoutes from './routes/curatedEdits.js';
import heroSlideRoutes from './routes/heroSlides.js';
import instagramRoutes from './routes/instagram.js';
import reviewRoutes from './routes/reviews.js';
import returnRoutes from './routes/returns.js';
import returnSettingsRoutes from './routes/returnSettings.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import customerRoutes from './routes/customers.js';
import { findGridFSFile, openGridFSStream } from './utils/gridfs.js';

// Cloudinary mapping for legacy MongoDB images (written by migrate-to-cloudinary.js).
// Used as a last-resort redirect so old /api/upload/images/<file> links keep
// working even after the MongoDB blobs are deleted to free the Atlas quota.
const CLOUDINARY_MAPPING_FILE = path.join(__dirname, 'cloudinary-migration.json');
const loadCloudinaryMapping = () => {
  try {
    if (fs.existsSync(CLOUDINARY_MAPPING_FILE)) {
      return JSON.parse(fs.readFileSync(CLOUDINARY_MAPPING_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not read cloudinary-migration.json:', error.message);
  }
  return {};
};
const cloudinaryMapping = loadCloudinaryMapping();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MIME_TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.ogg': 'video/ogg',
};

// Parses a single-range "bytes=start-end" header. Returns null when absent/unsupported.
const parseRange = (header, size) => {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === '' && match[2] === '')) return null;
  let start;
  let end;
  if (match[1] === '') {
    // suffix range: last N bytes
    const suffix = parseInt(match[2], 10);
    if (Number.isNaN(suffix)) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = parseInt(match[1], 10);
    end = match[2] === '' ? size - 1 : parseInt(match[2], 10);
    if (end > size - 1) end = size - 1;
  }
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) return 'invalid';
  return { start, end };
};

const setFileHeaders = (res, contentType) => {
  res.setHeader('Content-Type', contentType || 'application/octet-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=2592000');
};

app.get('/api/upload/images/:filename', async (req, res) => {
  const filename = path.basename(decodeURIComponent(req.params.filename));
  try {
    // 1) Current storage: MongoDB GridFS
    const gfsFile = await findGridFSFile(filename);
    if (gfsFile) {
      const size = gfsFile.length;
      setFileHeaders(res, gfsFile.contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      const range = parseRange(req.headers.range, size);
      if (range === 'invalid') {
        res.setHeader('Content-Range', `bytes */${size}`);
        return res.status(416).end();
      }
      if (range) {
        res.status(206);
        res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
        res.setHeader('Content-Length', range.end - range.start + 1);
      } else {
        res.setHeader('Content-Length', size);
      }
      const stream = openGridFSStream(filename, range || undefined);
      stream.on('error', (err) => {
        console.error('GridFS stream error:', err.message);
        res.destroy();
      });
      return stream.pipe(res);
    }

    // 2) Legacy images stored as a single MongoDB document
    const image = await Image.findOne({ filename });
    if (image) {
      setFileHeaders(res, image.contentType);
      res.setHeader('Content-Length', image.size);
      return res.send(image.data);
    }

    // 3) Oldest uploads saved on local disk (kept so old links never break)
    const diskPath = path.join(uploadDir, filename);
    if (fs.existsSync(diskPath)) {
      const ext = path.extname(filename).toLowerCase();
      setFileHeaders(res, MIME_TYPES[ext]);
      return res.sendFile(diskPath);
    }

    // 4) Migrated legacy image — redirect to Cloudinary
    const migrated = cloudinaryMapping[filename];
    if (migrated?.secure_url) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      return res.redirect(302, migrated.secure_url);
    }

    return res.status(404).json({ error: 'Image not found', filename });
  } catch (error) {
    console.error('Image fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/watchshop', watchShopRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/weaver-story', weaverStoryRoutes);
app.use('/api/curated-edits', curatedEditRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/return-settings', returnSettingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async () => {
  _envCheck();
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
