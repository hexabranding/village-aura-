import { Link } from 'react-router-dom';
import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { Collection } from '../data/products';

interface CollectionsProps {
  collections: Collection[];
}

const CARD_W = 250;
const GAP = 20;
const SCROLL_SPEED = 28;

export default function Collections({ collections }: CollectionsProps) {
  const x = useMotionValue(0);
  const paused = useRef(false);
  const totalWidth = collections.length * (CARD_W + GAP);

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
                  src={c.image}
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
