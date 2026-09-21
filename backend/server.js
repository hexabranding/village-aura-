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
  console.log('Image Storage: MongoDB');
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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/upload/images/:filename', async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  try {
    const image = await Image.findOne({ filename });
    if (!image) {
      return res.status(404).json({ error: 'Image not found', filename });
    }
    res.setHeader('Content-Type', image.contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    res.setHeader('Content-Length', image.size);
    return res.send(image.data);
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
