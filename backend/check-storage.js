import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
  const db = mongoose.connection.db;
  const stats = await db.admin().command({ dbStats: 1, scale: 1 });
  console.log(`DB total size: ${(stats.dataSize / 1024 / 1024).toFixed(1)} MB, storage: ${(stats.storageSize / 1024 / 1024).toFixed(1)} MB, collections: ${stats.collections}, indexes: ${(stats.indexSize / 1024 / 1024).toFixed(1)} MB`);

  const colls = await db.listCollections().toArray();
  const rows = [];
  for (const c of colls) {
    const s = await db.command({ collStats: c.name, scale: 1 });
    rows.push({ name: c.name, count: s.count, sizeMB: (s.size / 1024 / 1024), storageMB: (s.storageSize / 1024 / 1024) });
  }
  rows.sort((a, b) => b.sizeMB - a.sizeMB);
  console.log('\nTop collections by data size:');
  for (const r of rows.slice(0, 15)) {
    console.log(`  ${r.name.padEnd(30)} count=${String(r.count).padStart(6)}  size=${r.sizeMB.toFixed(1)}MB  storage=${r.storageMB.toFixed(1)}MB`);
  }

  // Sample GridFS / legacy image sizes
  try {
    const files = await db.collection('uploads.files').find().toArray();
    console.log(`\nGridFS files: ${files.length}`);
  } catch (e) { console.log('\nGridFS files: none'); }

  process.exit(0);
};
run().catch((e) => { console.error(e.message); process.exit(1); });
