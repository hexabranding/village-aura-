import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ZariDivider from '../components/ZariDivider';
import ProductCard from '../components/ProductCard';
import Collections from '../components/Collections';
import HappyClients from '../components/HappyClients';
import Instagram from '../components/Instagram';
import TiltImage from '../components/TiltImage';
import AdCarousel from '../components/AdCarousel';
import { products, collections } from '../data/products';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function ParallaxSection({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = target / (duration * 60);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 1000 / 60);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>;
}

function SectionHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {eyebrow}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ color: 'var(--ink-soft)', marginTop: '0.4rem', maxWidth: 480 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}



function DecorativeLine() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 60,
        height: 2,
        background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))',
        margin: '0.75rem 0 0',
        transformOrigin: 'left',
      }}
    />
  );
}

interface HomeProps {
  likedProducts: string[];
  onToggleLike: (id: string) => void;
}

export default function Home({ likedProducts, onToggleLike }: HomeProps) {
  const [activeFilter, setActiveFilter] = useState<'new' | 'best' | 'featured'>('new');
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const newArrivals = products.filter((p) => p.isNew);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const featured = products.filter((p) => p.featured);

  const filteredProducts =
    activeFilter === 'new'
      ? newArrivals
      : activeFilter === 'best'
      ? bestSellers
      : featured;

  return (
    <div>
      <Hero />

      {/* ─── Offer Marquee ─── */}
      <div
        style={{
          background: 'var(--maroon)',
          overflow: 'hidden',
          padding: '0.85rem 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: 'marquee 25s linear infinite',
          }}
        >
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                padding: '0 3rem',
              }}
            >
              ✦ Free Shipping on Orders Above ₹2999 &nbsp;&nbsp;&nbsp;
              ✦ New Suit Set Collection Out Now &nbsp;&nbsp;&nbsp;
              ✦ Handwoven authenticity guaranteed &nbsp;&nbsp;&nbsp;
              ✦ Easy 7-Day Returns &nbsp;&nbsp;&nbsp;
              ✦ COD Available &nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>

      {/* ─── Weaver Story ─── */}
      <ParallaxSection style={{ background: 'var(--ivory-deep)', padding: '4.5rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            style={{ flex: '1 1 320px' }}
          >
            <span className="eyebrow">By Hand, By Name</span>
            <DecorativeLine />
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '2rem', marginTop: '0.8rem', fontStyle: 'italic' }}
            >
              Every saree is signed by the loom that made it.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              style={{ color: 'var(--ink-soft)', lineHeight: 1.8, marginTop: '1rem', maxWidth: 480 }}
            >
              We work directly with 40 weaving families across Kanchipuram, Banaras, Chanderi and
              rural Bengal. No middle warehouses, no mass reproduction — a saree isn't cut from a
              bolt here, it's finished only when you order it.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.04, x: 3 }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-block', marginTop: '1.75rem' }}
            >
              <Link to="/shop" className="btn btn-solid">
                Meet the Weaves →
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            variants={slideFromRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            style={{
              flex: '1 1 380px',
              position: 'relative',
              height: 480,
            }}
          >
            {/* Left image — larger, main */}
            <TiltImage
              src="https://images.pexels.com/photos/19567892/pexels-photo-19567892.jpeg?w=500&h=650&fit=crop"
              alt="Weaver at the loom"
              expanded={hoveredImage === 0}
              onHoverChange={(h) => setHoveredImage(h ? 0 : null)}
              style={{
                position: 'absolute',
                width: hoveredImage === 0 ? '70%' : '62%',
                height: hoveredImage === 0 ? '100%' : '100%',
                left: 0,
                top: 0,
                zIndex: hoveredImage === 0 ? 5 : 2,
                transition: 'width 0.5s ease, z-index 0s',
              }}
            />
            {/* Right image — smaller, overlaps left */}
            <TiltImage
              src="https://images.pexels.com/photos/31660114/pexels-photo-31660114.jpeg?w=500&h=650&fit=crop"
              alt="Close detail of zari border weaving"
              expanded={hoveredImage === 1}
              onHoverChange={(h) => setHoveredImage(h ? 1 : null)}
              style={{
                position: 'absolute',
                width: hoveredImage === 1 ? '60%' : '52%',
                height: hoveredImage === 1 ? '90%' : '70%',
                right: 0,
                bottom: 0,
                zIndex: hoveredImage === 1 ? 5 : 3,
                transition: 'width 0.5s ease, height 0.5s ease, z-index 0s',
              }}
            />
          </motion.div>
        </div>
      </ParallaxSection>

      {/* ─── Banner Section ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'relative',
          height: '420px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(https://images.pexels.com/photos/27155546/pexels-photo-27155546.jpeg?w=1920&h=600&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(36,27,21,0.7) 0%, rgba(36,27,21,0.75) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem', maxWidth: 650 }}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              fontWeight: 500,
            }}
          >
            Handcrafted Elegance
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#fff',
              marginTop: '0.8rem',
              lineHeight: 1.15,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            Every thread tells a story of tradition.
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              width: 60,
              height: 2,
              background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))',
              margin: '1.2rem auto 0',
              transformOrigin: 'center',
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              fontSize: '0.95rem',
              color: 'var(--rose-dust)',
              marginTop: '1rem',
              lineHeight: 1.7,
            }}
          >
            From the looms of Kanchipuram to the bridal trousseaux of Banaras — sarees woven to be heirlooms.
          </motion.p>
        </div>
      </motion.section>

      {/* ─── Shop by Collection ─── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Shop by Collection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}
          >
            Sarees, Jewellery &amp; More
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
        <Collections collections={collections} />
      </section>

      <div className="container">
        <ZariDivider />
      </div>

      {/* ─── Category Filter Section ─── */}
      <section className="container" style={{ padding: '3rem 0 4.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'new' as const, label: 'New Arrivals' },
            { key: 'best' as const, label: 'Best Selling Products' },
            { key: 'featured' as const, label: 'Featured Products' },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setActiveFilter(btn.key)}
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: 30,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                transition: 'all 0.3s ease',
                background: activeFilter === btn.key ? 'var(--maroon)' : '#e8e8e8',
                color: activeFilter === btn.key ? '#fff' : 'var(--ink)',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <motion.div
          className="shop-grid"
          key={activeFilter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem 1.5rem',
          }}
        >
          {filteredProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <ProductCard
                product={p}
                index={i}
                isLiked={likedProducts.includes(p.id)}
                onToggleLike={onToggleLike}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Stats bar ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ background: 'var(--maroon-deep)', padding: '3rem 0', overflow: 'hidden' }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          {[
            { label: 'Weaving Families', value: 40 },
            { label: 'Years of Craft', value: 62 },
            { label: 'Sarees Delivered', value: 12000 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ textAlign: 'center', color: 'var(--ivory)' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 500, color: 'var(--gold-soft)' }}>
                <AnimatedCounter target={stat.value} />
                +
              </div>
              <div className="eyebrow" style={{ color: 'var(--rose-dust)', marginTop: '0.3rem' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── Happy Clients / Gallery ─── */}
      <HappyClients />

      {/* ─── Ad Carousel ─── */}
      <AdCarousel />

      {/* ─── Featured / This Season's Weaves ─── */}
      <ParallaxSection style={{ background: 'var(--ivory-deep)', padding: '4.5rem 0 3rem' }}>
        <div className="container">
          <SectionHeader
            eyebrow="The Edit"
            title="This Season's Weaves"
            action={
              <motion.div whileHover={{ scale: 1.04, x: 3 }} whileTap={{ scale: 0.97 }}>
                <Link to="/shop" className="btn">View All Sarees →</Link>
              </motion.div>
            }
          />
          <motion.div
            className="shop-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2rem 1.5rem',
            }}
          >
            {featured.map((p, i) => (
              <motion.div key={p.id} variants={scaleIn}>
              <ProductCard
                product={p}
                index={i}
                isLiked={likedProducts.includes(p.id)}
                onToggleLike={onToggleLike}
              />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ParallaxSection>

      {/* ─── Curated Edits ─── */}
      <section className="container" style={{ padding: '0 0 4.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <span className="eyebrow">Handpicked For You</span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}>Curated Edits</h2>
        </motion.div>
        <div
          className="pairing-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
        >
          {[
            {
              category: 'Sarees',
              eyebrow: 'Curated Edit',
              title: 'The Saree Collection',
              copy: 'Kanjivaram, Banarasi, Chanderi — six yards chosen for the moments you want to remember.',
              image: 'https://images.pexels.com/photos/30677843/pexels-photo-30677843.jpeg?w=900&h=700&fit=crop',
            },
            {
              category: 'Jewellery',
              eyebrow: 'Curated Edit',
              title: 'The Jewellery Collection',
              copy: 'Temple kemp, kundan and antique gold — pieces made to be worn with a six-yard drape.',
              image: 'https://images.pexels.com/photos/27103969/pexels-photo-27103969.jpeg?w=900&h=700&fit=crop',
            },
          ].map((edit, i) => (
            <motion.div
              key={edit.category}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius)', aspectRatio: '5/4', cursor: 'pointer' }}
            >
              <motion.img
                src={edit.image}
                alt={edit.title}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(0deg, rgba(36,27,21,0.82) 0%, rgba(36,27,21,0.15) 50%, transparent 80%)',
                }}
              />
              <div style={{ position: 'absolute', left: '1.75rem', right: '1.75rem', bottom: '1.75rem', color: 'var(--ivory)' }}>
                <motion.span
                  className="eyebrow"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  style={{ color: 'var(--gold-soft)' }}
                >
                  {edit.eyebrow}
                </motion.span>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{ color: 'var(--ivory)', fontSize: '1.8rem', fontStyle: 'italic', marginTop: '0.4rem' }}
                >
                  {edit.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{ fontSize: '0.85rem', color: 'var(--rose-dust)', marginTop: '0.5rem', maxWidth: 340 }}
                >
                  {edit.copy}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.04, x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-block', marginTop: '1.25rem' }}
                >
                  <Link
                    to={`/shop?category=${encodeURIComponent(edit.category)}`}
                    className="btn"
                    style={{ borderColor: 'var(--ivory)', color: 'var(--ivory)' }}
                  >
                    Explore →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Follow Us On Instagram ─── */}
      <Instagram />
    </div>
  );
}
