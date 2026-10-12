// Migrates legacy MongoDB images (the `images` collection) to Cloudinary.
//
// Usage (run from backend/):
//   node migrate-to-cloudinary.js              dry run — show what would be migrated
//   node migrate-to-cloudinary.js --run        upload everything to Cloudinary (resumable)
//   node migrate-to-cloudinary.js --rewrite    point products/gallery/ads/... at Cloudinary URLs
//   node migrate-to-cloudinary.js --delete-legacy --yes
//                                              remove migrated blobs from MongoDB (frees the quota)
//
// Nothing is ever deleted without --delete-legacy --yes, and blobs are only
// deleted for files that were successfully uploaded to Cloudinary.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { cloudinaryConfigured, uploadBufferToCloudinary } from './utils/cloudinary.js';
import Image from './models/Image.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const MAPPING_FILE = path.join(__dirname, 'cloudinary-migration.json');
const args = process.argv.slice(2);
const RUN = args.includes('--run');
const REWRITE = args.includes('--rewrite');
const DELETE_LEGACY = args.includes('--delete-legacy') && args.includes('--yes');

const fmt = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

const loadMapping = () => (fs.existsSync(MAPPING_FILE) ? JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8')) : {});
const saveMapping = (m) => fs.writeFileSync(MAPPING_FILE, JSON.stringify(m, null, 2));

// Uploads every legacy blob to Cloudinary, skipping files already migrated.
async function migrateUploads(mapping) {
  const images = await Image.find({}).select({ filename: 1, size: 1, contentType: 1 }).lean();
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  for (const [i, img] of images.entries()) {
    if (mapping[img.filename]) { skipped += 1; continue; }
    try {
      const doc = await Image.findById(img._id).lean();
      if (!doc || !doc.data) {
        console.log(`  [${i + 1}/${images.length}] SKIP (no data) ${img.filename}`);
        skipped += 1;
        continue;
      }
      const result = await uploadBufferToCloudinary(Buffer.from(doc.data.buffer ?? doc.data), {
        publicId: path.basename(img.filename, path.extname(img.filename)),
        overwrite: false,
      });
      mapping[img.filename] = { secure_url: result.secure_url, public_id: result.public_id, bytes: result.bytes };
      uploaded += 1;
      saveMapping(mapping); // checkpoint after every file so the run is resumable
      console.log(`  [${i + 1}/${images.length}] OK ${fmt(img.size).padStart(9)}  ${img.filename}`);
    } catch (e) {
      failed += 1;
      console.error(`  [${i + 1}/${images.length}] FAIL ${img.filename}: ${e.message}`);
    }
  }
  console.log(`\nUpload complete: ${uploaded} uploaded, ${skipped} already done/empty, ${failed} failed.`);
  return failed;
}

// Rewrites /api/upload/images/<file> references in every collection to Cloudinary URLs.
async function rewriteReferences(mapping) {
  const db = mongoose.connection.db;
  const cols = (await db.listCollections().toArray()).map((c) => c.name).filter((n) => n !== 'images');
  let totalReplaced = 0;
  for (const name of cols) {
    const coll = db.collection(name);
    const ops = [];
    const cursor = coll.find({});
    for await (const doc of cursor) {
      let json = JSON.stringify(doc);
      if (!json.includes('/api/upload/images/')) continue;
      let changed = false;
      for (const [filename, entry] of Object.entries(mapping)) {
        const variants = [`/api/upload/images/${filename}`, `/api/upload/images/${encodeURIComponent(filename)}`];
        for (const v of variants) {
          if (json.includes(v)) { json = json.split(v).join(entry.secure_url); changed = true; }
        }
      }
      if (!changed) continue;
      const updated = JSON.parse(json);
      // JSON round-tripping turns ObjectId into a hex string — restore the
      // original _id so the replacement doesn't look like it altered _id.
      updated._id = doc._id;
      ops.push({ replaceOne: { filter: { _id: doc._id }, replacement: updated } });
      if (ops.length >= 100) {
        const r = await coll.bulkWrite(ops, { ordered: false });
        totalReplaced += r.modifiedCount;
        ops.length = 0;
      }
    }
    if (ops.length) {
      const r = await coll.bulkWrite(ops, { ordered: false });
      totalReplaced += r.modifiedCount;
    }
  }
  console.log(`Rewrite complete: ${totalReplaced} documents now point at Cloudinary.`);
}

// Deletes migrated blobs from the legacy `images` collection (frees MongoDB space).
async function deleteLegacy(mapping) {
  const filenames = Object.keys(mapping);
  let freed = 0;
  let bytes = 0;
  for (const filename of filenames) {
    const doc = await Image.findOneAndDelete({ filename }).lean();
    if (doc) { freed += 1; bytes += doc.size || 0; }
  }
  console.log(`Deleted ${freed} legacy blobs from MongoDB, freeing ${fmt(bytes)}.`);
}

const run = async () => {
  if (!cloudinaryConfigured()) {
    console.error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to backend/.env first.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
  console.log('MongoDB connected');
  const mapping = loadMapping();

  if (REWRITE) {
    await rewriteReferences(mapping);
  } else if (DELETE_LEGACY) {
    await deleteLegacy(mapping);
  } else if (RUN) {
    const failed = await migrateUploads(mapping);
    process.exitCode = failed > 0 ? 1 : 0;
  } else {
    const total = await Image.countDocuments();
    const agg = await Image.aggregate([{ $group: { _id: null, n: { $sum: 1 }, bytes: { $sum: '$size' } } }]);
    const totalBytes = agg[0]?.bytes || 0;
    const migrated = Object.keys(mapping).length;
    console.log('DRY RUN — nothing uploaded or deleted.');
    console.log(`Legacy images in MongoDB : ${total} (${fmt(totalBytes)})`);
    console.log(`Already on Cloudinary    : ${migrated}`);
    console.log(`Remaining to migrate     : ${total - migrated}`);
    console.log('\nNext steps:');
    console.log('  1. node migrate-to-cloudinary.js --run');
    console.log('  2. node migrate-to-cloudinary.js --rewrite   (needs MongoDB writes to be unblocked)');
    console.log('  3. node migrate-to-cloudinary.js --delete-legacy --yes   (only after verifying the site)');
  }

  await mongoose.disconnect();
  process.exit(process.exitCode || 0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
