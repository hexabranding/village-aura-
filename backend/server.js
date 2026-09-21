import path from 'path';
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
  console.log('R2 Storage:', R2.isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED (local only)');
};

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import connectDB from './config/db.js';
import R2 from './utils/r2.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import adRoutes from './routes/ads.js';
import dashboardRoutes from './routes/dashboard.js';
import uploadRoutes from './routes/upload.js';
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

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
};

const imageDirs = [uploadsDir];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/upload/images/:filename', async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  for (const dir of imageDirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filename).toLowerCase();
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      return fs.createReadStream(filePath).pipe(res);
    }
  }
  if (R2.isConfigured) {
    try {
      const localPath = path.join(uploadsDir, filename);
      const downloaded = await R2.downloadFile(filename, localPath);
      if (downloaded) {
        const ext = path.extname(filename).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        return fs.createReadStream(localPath).pipe(res);
      }
    } catch (e) {
      console.error('R2 fallback failed:', e.message);
    }
  }
  res.status(404).json({ error: 'Image not found', filename });
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
