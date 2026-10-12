// Repairs zero-byte Cloudinary assets created during the migration by
// re-uploading the same file from the local disk backup (overwrite: true).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { cloudinaryConfigured, uploadBufferToCloudinary } from './utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const MAPPING_FILE = path.join(__dirname, 'cloudinary-migration.json');
const uploadDir = path.join(__dirname, 'uploads');

const listAll = async (resourceType) => {
  const out = [];
  let nextBreakToken;
  do {
    const res = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      prefix: 'village-allure/',
      max_results: 500,
      ...(nextBreakToken ? { next_break_token: nextBreakToken } : {}),
    });
    out.push(...res.resources);
    nextBreakToken = res.next_break_token;
  } while (nextBreakToken);
  return out;
};

const run = async () => {
  if (!cloudinaryConfigured()) { console.error('Cloudinary not configured'); process.exit(1); }
  const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

  const images = await listAll('image');
  const videos = await listAll('video');
  const all = [...images, ...videos];
  const bad = all.filter((r) => !r.bytes);
  console.log(`Cloudinary holds ${all.length} assets under village-allure/ — ${bad.length} are empty (0 bytes).`);
  if (bad.length === 0) { console.log('Nothing to repair.'); return; }

  const badIds = new Set(bad.map((r) => r.public_id));
  let repaired = 0;
  let failed = 0;
  for (const [filename, entry] of Object.entries(mapping)) {
    if (!badIds.has(entry.public_id)) continue;
    const local = path.join(uploadDir, path.basename(filename));
    if (!fs.existsSync(local)) {
      console.error(`  MISSING local file for ${filename} (public_id ${entry.public_id})`);
      failed += 1;
      continue;
    }
    const buffer = fs.readFileSync(local);
    // entry.public_id includes the "village-allure/" folder prefix; the upload
    // helper adds the folder itself, so strip it here.
    const publicId = entry.public_id.replace(/^village-allure\//, '');
    try {
      const result = await uploadBufferToCloudinary(buffer, {
        publicId,
        overwrite: true,
      });
      entry.secure_url = result.secure_url;
      entry.bytes = result.bytes;
      repaired += 1;
      console.log(`  repaired ${entry.public_id} (${result.bytes} bytes)`);
    } catch (e) {
      failed += 1;
      console.error(`  FAIL ${entry.public_id}: ${e.message}`);
    }
  }
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
  console.log(`Repair complete: ${repaired} re-uploaded, ${failed} failed.`);

  // verify
  const after = [...(await listAll('image')), ...(await listAll('video'))];
  const stillBad = after.filter((r) => !r.bytes);
  console.log(`Verification: ${after.length} assets, ${stillBad.length} empty.`);
};

run().catch((e) => { console.error(e); process.exit(1); });
