import { motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

const instaPosts = [
  { src: 'https://images.pexels.com/photos/28428053/pexels-photo-28428053.jpeg?w=500&h=500&fit=crop', label: 'Sarees' },
  { src: 'https://images.pexels.com/photos/37054317/pexels-photo-37054317.jpeg?w=500&h=500&fit=crop', label: 'Suit Sets' },
  { src: 'https://images.pexels.com/photos/37054321/pexels-photo-37054321.jpeg?w=500&h=500&fit=crop', label: 'Weaves' },
  { src: 'https://images.pexels.com/photos/30244535/pexels-photo-30244535.jpeg?w=500&h=500&fit=crop', label: 'Bags' },
  { src: 'https://images.pexels.com/photos/37054325/pexels-photo-37054325.jpeg?w=500&h=500&fit=crop', label: 'Jewellery' },
  { src: 'https://images.pexels.com/photos/28428060/pexels-photo-28428060.jpeg?w=500&h=500&fit=crop', label: 'New Arrivals' },
];

const CARD_WIDTH = 260;
const CARD_HEIGHT = 340;
const GAP = 14;
const SCROLL_SPEED = 30;

export default function Instagram() {
  const x = useMotionValue(0);
  const paused = useRef(false);
  const totalWidth = instaPosts.length * (CARD_WIDTH + GAP);

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

  const duplicated = [...instaPosts, ...instaPosts, ...instaPosts];

  return (
    <section style={{ padding: '5.5rem 0', overflow: 'hidden' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
@village__allure
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}
        >
          Follow Us On Instagram
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))',
            margin: '0.75rem auto 0',
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* Scrolling row */}
      <div
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        style={{ overflow: 'hidden', cursor: 'grab', padding: '0.5rem 0' }}
      >
        <motion.div
          style={{ x, display: 'flex', gap: `${GAP}px`, willChange: 'transform' }}
        >
          {duplicated.map((post, i) => (
            <motion.div
              key={`${post.label}-${i}`}
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flexShrink: 0,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
              }}
            >
              <img
                src={post.src}
                alt={post.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              {/* Hover overlay */}
              <div
                className="insta-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(36,27,21,0.5)',
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ivory)" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="var(--ivory)" stroke="none" />
                </svg>
              </div>
              {/* Label */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '0.75rem',
                  background: 'linear-gradient(0deg, rgba(36,27,21,0.55) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--ivory)',
                    fontWeight: 500,
                    textAlign: 'center',
                  }}
                >
                  {post.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <motion.div whileHover={{ scale: 1.04, x: 3 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
          <a
            href="https://www.instagram.com/village__allure"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Follow @village__allure →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
