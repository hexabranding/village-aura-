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
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function GalleryCard({ image, index }: { image: GalleryImage; index: number }) {
  const isLarge = index === 0;
  const isTall = index === 2;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`gallery-card gallery-card-${index}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
                borderRadius: 'var(--radius)',
        cursor: 'pointer',
      }}
    >
      <img
        src={image.src}
        alt={image.title}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.5s ease',
        }}
      />

      {/* Hover overlay */}
      <div
        className="gallery-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(36,27,21,0.1) 0%, rgba(36,27,21,0.55) 100%)',
          opacity: 0,
          transition: 'opacity 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: isLarge ? '2rem' : '1.25rem',
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isLarge ? '2rem' : isTall ? '1.6rem' : '1.25rem',
            fontWeight: 500,
            fontStyle: 'italic',
            color: 'var(--ivory)',
            marginBottom: '0.5rem',
            lineHeight: 1.2,
          }}
        >
          {image.title}
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
          {image.subtitle}
        </div>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  return (
    <section className="container" style={{ padding: '4.5rem 0' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The Collection
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}
        >
          Saree Gallery
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

      <div className="gallery-grid">
        {images.map((img, i) => (
          <GalleryCard key={img.src} image={img} index={i} />
        ))}
      </div>
    </section>
  );
}
