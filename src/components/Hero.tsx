import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, resolveUploadUrl } from '../lib/api';

const heroSlides = [
  {
    eyebrow: 'Woven Since 1962 — Kanchipuram, Banaras, Bengal',
    headline: ['Six yards,', 'one lifetime of moments.'],
    cta: { label: 'Shop the Weave', to: '/shop' },
    ctaSecondary: { label: 'Sarees', to: '/shop?category=Sarees' },
    image: 'https://images.pexels.com/photos/1229414/pexels-photo-1229414.jpeg?w=1920&h=1080&fit=crop',
  },
  {
    eyebrow: 'New Arrivals — Just Off the Loom',
    headline: ['Fresh weaves,', 'crafted this season.'],
    cta: { label: 'New Arrivals', to: '/shop' },
    ctaSecondary: { label: 'Jewellery', to: '/shop?category=Jewellery' },
    image: 'https://images.pexels.com/photos/1229414/pexels-photo-1229414.jpeg?w=1920&h=1080&fit=crop',
  },
  {
    eyebrow: 'The Wedding Edit — Banarasi Heritage',
    headline: ['Woven for the', 'day you remember.'],
    cta: { label: 'Explore Suit Sets', to: '/shop?category=Unstitched%20Suit%20Sets' },
    ctaSecondary: { label: 'All Collections', to: '/shop' },
    image: 'https://images.pexels.com/photos/1229414/pexels-photo-1229414.jpeg?w=1920&h=1080&fit=crop',
  },
];

function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.5, 0.5, 0] }}
      transition={{
        duration: 8 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--gold)',
        pointerEvents: 'none',
      }}
    />
  );
}

function CharReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden' }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: delay + i * 0.02, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const [slides, setSlides] = useState(heroSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  useEffect(() => {
    api.heroSlides.getActive().then((data: any[]) => {
      if (data.length > 0) {
        setSlides(data.map((s: any) => ({
          eyebrow: s.eyebrow,
          headline: Array.isArray(s.headline) ? s.headline : [s.headline],
          cta: { label: s.ctaLabel, to: s.ctaLink },
          ctaSecondary: { label: s.ctaSecondaryLabel, to: s.ctaSecondaryLink },
          image: s.image,
        })));
      }
    }).catch(() => {});
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
    },
    [current],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] || slides[0];

  const textVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Full background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${resolveUploadUrl(slide.image)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(36,27,21,0.85) 0%, rgba(36,27,21,0.5) 50%, rgba(36,27,21,0.2) 100%)',
        }}
      />

      {/* Bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, transparent 55%, rgba(36,27,21,0.45) 100%)',
        }}
      />

      {/* Floating gold particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.35}
            x={3 + i * 2.5}
            size={2 + (i % 5) * 1.5}
          />
        ))}
      </div>

      {/* Text content — left aligned */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 'clamp(7rem, 14vh, 11rem) clamp(2rem, 6vw, 6rem)',
          maxWidth: 'min(700px, 90vw)',
          textAlign: 'left',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            <motion.span
              initial={{ opacity: 0, y: 12, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--gold-soft)',
                fontWeight: 500,
              }}
            >
              {slide.eyebrow}
            </motion.span>

            <h1
              style={{
                fontSize: 'clamp(1.8rem, 5.5vw, 4.8rem)',
                lineHeight: 1.05,
                fontStyle: 'italic',
                fontWeight: 500,
                color: '#fff',
                textShadow: '0 2px 30px rgba(0,0,0,0.3)',
              }}
            >
              {slide.headline.map((line, i) => (
                <span key={i} style={{ display: 'block', overflow: 'hidden' }}>
                  <CharReveal text={line} delay={0.15 + i * 0.15} />
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontSize: '1rem',
                color: 'var(--rose-dust)',
                maxWidth: 420,
                lineHeight: 1.75,
              }}
            >
              {slide.headline[0]}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}
            >
              <motion.div whileHover={{ scale: 1.05, x: 3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={slide.cta.to}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.95rem clamp(1.2rem, 3vw, 2.2rem)',
                    background: 'var(--gold)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    transition: 'background 0.35s ease, box-shadow 0.35s ease',
                  }}
                >
                  {slide.cta.label} →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, x: 3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={slide.ctaSecondary.to}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.95rem clamp(1.2rem, 3vw, 2.2rem)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    background: 'transparent',
                    color: '#fff',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    transition: 'background 0.35s ease, border-color 0.35s ease',
                  }}
                >
                  {slide.ctaSecondary.label}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '3.5rem',
            alignItems: 'center',
          }}
        >
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: i === current ? 36 : 10,
                height: 10,
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
