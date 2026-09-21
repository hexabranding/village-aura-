import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '.env') });

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true, index: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true, index: true },
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
};

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

async function uploadFolder(folderPath) {
  const files = fs.readdirSync(folderPath).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov', '.webm'].includes(ext);
  });

  console.log(`Found ${files.length} images in ${folderPath}`);

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const ext = path.extname(file).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);
    const filename = sanitizeFilename(file);
    const url = `/api/upload/images/${filename}`;

    const exists = await Image.findOne({ filename });
    if (exists) {
      skipped++;
      continue;
    }

    await Image.create({
      filename,
      contentType,
      data,
      size: data.length,
      url,
    });
    uploaded++;
    console.log(`  Uploaded: ${file} -> ${url} (${(data.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped`);
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.log('Usage: node upload-images.js <folder-path>');
    console.log('Example: node upload-images.js C:\\Users\\sunan\\Downloads\\product-images');
    process.exit(1);
  }

  if (!fs.existsSync(folder)) {
    console.error(`Folder not found: ${folder}`);
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
  console.log('Connected to MongoDB\n');

  await uploadFolder(folder);

  const count = await Image.countDocuments();
  console.log(`\nTotal images in MongoDB: ${count}`);

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
