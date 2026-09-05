import { Link } from 'react-router-dom';
import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { api, resolveUploadUrl } from '../lib/api';
import type { Collection } from '../data/products';

interface CollectionsProps {
  collections: Collection[];
}

const CARD_W = 250;
const GAP = 20;
const SCROLL_SPEED = 28;

const publicImages = [
  '/images/IMG_9630.PNG',
  '/images/IMG_9588.PNG',
  '/images/IMG_9587.PNG',
  '/images/IMG_8835.PNG',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_19_32%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_09_29%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_08_42%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_08_05%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_08_00%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_07_15%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_06_25%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_05_20%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_02_42%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2003_52_09%20PM.png',
  '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2003_50_46%20PM.png',
];

export default function Collections({ collections }: CollectionsProps) {
  const x = useMotionValue(0);
  const paused = useRef(false);
  const totalWidth = collections.length * (CARD_W + GAP);
  const [randImages, setRandImages] = useState<Record<string, string>>({});
  const loadCategoryImages = () => {
    api.categories.getAll().then((cats) => {
      const catImageMap: Record<string, string> = {};
      cats.forEach((cat) => { if (cat.image) catImageMap[cat.name] = cat.image; });
      const shuffled = [...publicImages].sort(() => 0.5 - Math.random());
      const map: Record<string, string> = {};
      collections.forEach((c, i) => {
        if (catImageMap[c.category]) map[c.category] = catImageMap[c.category];
        else map[c.category] = shuffled[i % shuffled.length];
      });
      setRandImages(map);
    }).catch(() => {
      const shuffled = [...publicImages].sort(() => 0.5 - Math.random());
      const map: Record<string, string> = {};
      collections.forEach((c, i) => { map[c.category] = shuffled[i % shuffled.length]; });
      setRandImages(map);
    });
  };
  useEffect(() => {
    loadCategoryImages();
    const onUpdate = () => loadCategoryImages();
    window.addEventListener('categoriesUpdated', onUpdate);
    window.addEventListener('focus', onUpdate);
    return () => { window.removeEventListener('categoriesUpdated', onUpdate); window.removeEventListener('focus', onUpdate); };
  }, [collections]);

  useEffect(() => {
    let pos = 0;
    let raf: number;

    const loop = () => {
      if (!paused.current) {
        pos -= SCROLL_SPEED / 60;
        if (Math.abs(pos) >= totalWidth) pos += totalWidth;
        x.set(pos);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [x, totalWidth]);

  const duplicated = [...collections, ...collections, ...collections];

  return (
    <section style={{ overflow: 'hidden' }}>
      <div
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        style={{ overflow: 'hidden', cursor: 'grab', padding: '0.5rem 0' }}
      >
        <motion.div
          style={{ x, display: 'flex', gap: `${GAP}px`, willChange: 'transform' }}
        >
          {duplicated.map((c, i) => (
            <motion.div
              key={`${c.category}-${i}`}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ flexShrink: 0, width: CARD_W }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(c.category)}`}
                style={{
                  position: 'relative',
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius)',
                  aspectRatio: '3 / 4',
                }}
                className="collection-card"
              >
                <motion.img
                  src={resolveUploadUrl(randImages[c.category] || c.image)}
                  alt={c.title}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 30%, rgba(36,27,21,0.8) 100%)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <div style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem', color: 'var(--ivory)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontStyle: 'italic' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--rose-dust)', marginTop: '0.2rem' }}>
                    {c.tagline}
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    bottom: '1rem',
                    color: 'var(--gold-soft)',
                    fontSize: '1.2rem',
                  }}
                >
                  →
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
