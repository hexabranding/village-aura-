import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveToGridFS, findGridFSFile } from './utils/gridfs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

async function sync() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  console.log('Connected to MongoDB.');

  // 1. Collect all image/media filenames referenced in any database collection
  const referencedFilenames = new Set();
  const collect = (obj) => {
    if (typeof obj === 'string') {
      if (obj.includes('cloudinary.com') || obj.includes('village-allure/') || obj.includes('/api/upload/images/')) {
        const clean = obj.split('/').pop().split('?')[0].replace(/^[\/\\]+/, '');
        if (clean) referencedFilenames.add(clean);
      }
    } else if (Array.isArray(obj)) obj.forEach(collect);
    else if (obj && typeof obj === 'object') Object.values(obj).forEach(collect);
  };

  const collections = [
    'products', 'ads', 'galleries', 'watchshops', 'testimonials',
    'heroslides', 'curatededits', 'instagrams', 'weaverstories', 'returns', 'orders'
  ];

  for (const name of collections) {
    try {
      const rows = await db.collection(name).find({}).toArray();
      rows.forEach(r => collect(r));
    } catch (e) {
      console.warn(`Could not read ${name}:`, e.message);
    }
  }

  console.log(`Found ${referencedFilenames.size} unique media files referenced in the database.`);

  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    console.error('uploads directory not found!');
    process.exit(1);
  }

  const localFiles = fs.readdirSync(uploadDir);
  const localSet = new Set(localFiles);

  let synced = 0;
  let alreadyPresent = 0;
  let missingFromLocal = 0;
  let totalBytes = 0;

  for (const filename of referencedFilenames) {
    // Check if already in GridFS
    const existing = await findGridFSFile(filename);
    if (existing) {
      alreadyPresent++;
      continue;
    }

    // Check if on local disk
    let diskName = filename;
    if (!localSet.has(diskName)) {
      // Try alt extension
      const parsed = path.parse(filename);
      for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
        if (localSet.has(parsed.name + ext)) {
          diskName = parsed.name + ext;
          break;
        }
      }
    }

    if (!localSet.has(diskName)) {
      missingFromLocal++;
      continue;
    }

    const filePath = path.join(uploadDir, diskName);
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(diskName).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    await saveToGridFS(filename, buf, mime);
    synced++;
    totalBytes += buf.length;
    if (synced % 20 === 0 || synced === 1) {
      console.log(`Synced ${synced} files (${(totalBytes / 1024 / 1024).toFixed(1)} MB)...`);
    }
  }

  console.log('\n--- SYNC SUMMARY ---');
  console.log(`Already in GridFS:    ${alreadyPresent}`);
  console.log(`Newly synced to GFS:  ${synced} (${(totalBytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Missing from local:   ${missingFromLocal}`);
  console.log('All referenced files are now live in MongoDB GridFS!');
  process.exit(0);
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
