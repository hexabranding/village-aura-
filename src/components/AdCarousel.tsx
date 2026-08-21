import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    image: 'https://images.pexels.com/photos/30677843/pexels-photo-30677843.jpeg?w=1400&h=500&fit=crop',
    eyebrow: 'New Arrival',
    title: 'Festive Silk Edit',
    subtitle: 'Handwoven Banarasi sarees for the modern celebration',
    cta: 'Shop Now',
    link: '/shop?category=Sarees',
  },
  {
    image: 'https://images.pexels.com/photos/27103969/pexels-photo-27103969.jpeg?w=1400&h=500&fit=crop',
    eyebrow: 'Limited Edition',
    title: 'Temple Kemp Jewellery',
    subtitle: 'Antique gold jewellery crafted by master artisans',
    cta: 'Explore',
    link: '/shop?category=Jewellery',
  },
  {
    image: 'https://images.pexels.com/photos/19567892/pexels-photo-19567892.jpeg?w=1400&h=500&fit=crop',
    eyebrow: 'Handwoven',
    title: 'Kanchipuram Pure Silk',
    subtitle: 'Six yards of tradition from Tamil Nadu\'s finest looms',
    cta: 'View Collection',
    link: '/shop?category=Sarees',
  },
];

export default function AdCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 3000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: 420,
        background: 'var(--ivory-deep)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          {/* Background image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${slides[current].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(36,27,21,0.85) 0%, rgba(36,27,21,0.5) 50%, transparent 100%)',
            }}
          />
          {/* Content */}
          <div
            className="container"
            style={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              maxWidth: 600,
              paddingLeft: 'clamp(1.5rem, 4vw, 3rem)',
            }}
          >
            <motion.span
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="eyebrow"
              style={{ color: 'var(--gold-soft)', marginBottom: '0.75rem' }}
            >
              {slides[current].eyebrow}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontStyle: 'italic',
                fontWeight: 500,
                color: '#fff',
                lineHeight: 1.15,
                marginBottom: '0.75rem',
              }}
            >
              {slides[current].title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                fontSize: '0.95rem',
                color: 'var(--rose-dust)',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
                maxWidth: 440,
              }}
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <a
                href={slides[current].link}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 2rem',
                  background: 'var(--gold)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gold-soft)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,169,110,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gold)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {slides[current].cta} →
              </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.6rem',
          zIndex: 10,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: current === i ? 28 : 10,
              height: 10,
              borderRadius: 5,
              border: 'none',
              cursor: 'pointer',
              background: current === i ? 'var(--gold)' : 'rgba(255,255,255,0.4)',
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Arrow buttons */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(4px)',
          border: 'none',
          color: '#fff',
          width: 44,
          height: 44,
          borderRadius: '50%',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.3s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(4px)',
          border: 'none',
          color: '#fff',
          width: 44,
          height: 44,
          borderRadius: '50%',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.3s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        ›
      </button>
    </section>
  );
}
