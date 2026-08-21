import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GalleryImage {
  src: string;
  title: string;
  subtitle: string;
}

const images: GalleryImage[] = [
  {
    src: 'https://images.pexels.com/photos/12707148/pexels-photo-12707148.jpeg?w=800&h=1200&fit=crop',
    title: 'Tissue',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/27155550/pexels-photo-27155550.jpeg?w=600&h=400&fit=crop',
    title: 'Statement of Self Expression',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/27155540/pexels-photo-27155540.jpeg?w=600&h=900&fit=crop',
    title: 'Bandhini',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/27155545/pexels-photo-27155545.jpeg?w=600&h=400&fit=crop',
    title: 'Bengal Cotton',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/8489649/pexels-photo-8489649.jpeg?w=600&h=400&fit=crop',
    title: 'Silk Stories',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/30249392/pexels-photo-30249392.jpeg?w=600&h=400&fit=crop',
    title: 'Modern Weaves',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=600&h=800&fit=crop',
    title: 'Kanchipuram Silk',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/2693526/pexels-photo-2693526.jpeg?w=600&h=400&fit=crop',
    title: 'Banarasi Elegance',
    subtitle: 'VIEW MORE',
  },
  {
    src: 'https://images.pexels.com/photos/3819969/pexels-photo-3819969.jpeg?w=600&h=400&fit=crop',
    title: 'Chanderi Grace',
    subtitle: 'VIEW MORE',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function GalleryPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ padding: '2.5rem 0 5rem' }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: '2rem' }}>
        <Link to="/">Home</Link> &nbsp;/&nbsp; <span style={{ color: 'var(--ink)' }}>Gallery</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          The Collection
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginTop: '0.4rem' }}
        >
          Saree Gallery
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }}
      >
        {images.map((img, i) => (
          <motion.div
            key={`${img.src}-${i}`}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--radius)',
              aspectRatio: '3/4',
              cursor: 'pointer',
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.5s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(36,27,21,0.1) 0%, rgba(36,27,21,0.55) 100%)',
                opacity: 0,
                transition: 'opacity 0.5s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: 'var(--ivory)',
                  marginBottom: '0.5rem',
                  lineHeight: 1.2,
                }}
              >
                {img.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-soft)',
                  fontWeight: 500,
                }}
              >
                {img.subtitle}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
