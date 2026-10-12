import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'village-allure' });
  const db = mongoose.connection.db;
  const coll = db.collection('images');

  const docs = await coll.find({}, { projection: { filename: 1, size: 1, url: 1 } }).toArray();
  const sizes = docs.map((d) => d.size || 0);
  const total = sizes.reduce((a, b) => a + b, 0);
  console.log(`docs=${docs.length} total=${(total / 1024 / 1024).toFixed(1)}MB avg=${(total / docs.length / 1024).toFixed(0)}KB`);

  // size duplicates
  const bySize = new Map();
  for (const d of docs) {
    const s = d.size || 0;
    if (!bySize.has(s)) bySize.set(s, []);
    bySize.get(s).push(d);
  }
  let dupeCount = 0, dupeBytes = 0, groups = 0;
  for (const [, g] of bySize) {
    if (g.length > 1) { groups++; dupeCount += g.length - 1; dupeBytes += (g[0].size || 0) * (g.length - 1); }
  }
  console.log(`same-size groups=${groups} extraDocs=${dupeCount} wasted=${(dupeBytes / 1024 / 1024).toFixed(1)}MB`);

  // biggest
  const top = [...docs].sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, 10);
  console.log('top10 largest:');
  top.forEach((d) => console.log(`  ${((d.size || 0) / 1024).toFixed(0)}KB  ${d.filename}`));

  // size distribution buckets
  const buckets = { '<100KB': 0, '100-300KB': 0, '300-600KB': 0, '600KB-1MB': 0, '>1MB': 0 };
  for (const s of sizes) {
    if (s < 100 * 1024) buckets['<100KB']++;
    else if (s < 300 * 1024) buckets['100-300KB']++;
    else if (s < 600 * 1024) buckets['300-600KB']++;
    else if (s < 1024 * 1024) buckets['600KB-1MB']++;
    else buckets['>1MB']++;
  }
  console.log('distribution:', JSON.stringify(buckets));

  // orphan check: which image URLs are referenced by products/ads/etc.
  const referenced = new Set();
  const collect = (obj) => {
    if (typeof obj === 'string') {
      if (obj.startsWith('/api/upload/images/')) referenced.add(obj.split('/').pop());
    } else if (Array.isArray(obj)) obj.forEach(collect);
    else if (obj && typeof obj === 'object') Object.values(obj).forEach(collect);
  };
  for (const collName of ['products', 'ads', 'galleries', 'watchshops', 'testimonials', 'heroslides', 'curatededits', 'instagrams', 'weaverstories', 'returns', 'orders']) {
    try {
      const rows = await db.collection(collName).find({}).toArray();
      rows.forEach((r) => { delete r._id; collect(r); });
    } catch {}
  }
  const allNames = new Set(docs.map((d) => d.filename));
  let referencedCount = 0, referencedBytes = 0, orphanCount = 0, orphanBytes = 0;
  for (const d of docs) {
    if (referenced.has(d.filename)) { referencedCount++; referencedBytes += (d.size || 0); }
    else { orphanCount++; orphanBytes += (d.size || 0); }
  }
  console.log(`\nreferenced=${referencedCount} (${(referencedBytes / 1024 / 1024).toFixed(1)}MB)  orphaned(unused)=${orphanCount} (${(orphanBytes / 1024 / 1024).toFixed(1)}MB)`);
  console.log(`referenced names found in db: ${referenced.size} of ${allNames.size}`);

  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
