// One-time migration: moves any files still sitting in the local uploads/
// folder into MongoDB GridFS so every image/video lives in the database.
// Safe to run repeatedly - files already in GridFS are skipped.
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { saveToGridFS, findGridFSFile } from './utils/gridfs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const uploadDir = path.join(__dirname, 'uploads');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
  console.log('MongoDB connected');

  if (!fs.existsSync(uploadDir)) {
    console.log('No uploads folder - nothing to migrate');
    process.exit(0);
  }

  const files = fs.readdirSync(uploadDir).filter((f) => !f.startsWith('.'));
  console.log(`Found ${files.length} local file(s) to check`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  const MIME = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
    '.ogg': 'video/ogg',
  };

  for (const filename of files) {
    try {
      const existing = await findGridFSFile(filename);
      if (existing) {
        skipped++;
        continue;
      }
      const filePath = path.join(uploadDir, filename);
      const buffer = fs.readFileSync(filePath);
      const contentType = MIME[path.extname(filename).toLowerCase()] || 'application/octet-stream';
      await saveToGridFS(filename, buffer, contentType);
      migrated++;
      console.log(`migrated: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
    } catch (err) {
      failed++;
      console.error(`failed: ${filename} - ${err.message}`);
    }
  }

  console.log(`Done. migrated=${migrated} skipped=${skipped} failed=${failed}`);
  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
