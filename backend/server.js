import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.use('/api/upload/images', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
