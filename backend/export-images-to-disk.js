// Exports every legacy image blob from MongoDB to backend/uploads/ so the
// files also exist on local disk (served automatically by server.js).
// Read-only with respect to MongoDB — nothing is modified or deleted.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import Image from './models/Image.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const uploadDir = path.join(__dirname, 'uploads');
const backupDir = path.join(uploadDir); // disk files are served directly by the image route

const run = async () => {
  fs.mkdirSync(backupDir, { recursive: true });
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
  const images = await Image.find({}).select({ filename: 1, size: 1 }).lean();
  let written = 0;
  let skippedExisting = 0;
  let missingData = 0;
  let bytes = 0;
  for (const [i, img] of images.entries()) {
    const safe = path.basename(img.filename);
    const dest = path.join(backupDir, safe);
    if (fs.existsSync(dest)) { skippedExisting += 1; continue; }
    const doc = await Image.findById(img._id).lean();
    if (!doc || !doc.data) { missingData += 1; continue; }
    const buf = Buffer.from(doc.data.buffer ?? doc.data);
    fs.writeFileSync(dest, buf);
    written += 1;
    bytes += buf.length;
    if ((i + 1) % 50 === 0) console.log(`  progress ${i + 1}/${images.length} (written=${written})`);
  }
  const onDisk = fs.readdirSync(backupDir).length;
  console.log(`Export done: ${written} files written (${(bytes / 1024 / 1024).toFixed(1)} MB), ${skippedExisting} already on disk, ${missingData} had no data.`);
  console.log(`backend/uploads now holds ${onDisk} files.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
