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
import Testimonials from '../components/Testimonials';
import { products as localProducts, collections } from '../data/products';
import { api, resolveUploadUrl } from '../lib/api';
import type { Product as ProductType } from '../data/products';

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

interface WatchShopItem {
  id: string;
  name: string;
  price: string;
  poster: string;
  video: string;
}

const fallbackWatchShopItems: WatchShopItem[] = [
  {
    id: 'kanjivaram-silk-magenta',
    name: 'Kanjivaram Silk — Magenta Bloom',
    price: '₹18,500',
    poster: 'https://images.pexels.com/photos/1229414/pexels-photo-1229414.jpeg?w=500&h=900&fit=crop',
    video: '',
  },
  {
    id: 'temple-kemp-necklace',
    name: 'Temple Kemp Necklace Set',
    price: '₹6,400',
    poster: 'https://images.pexels.com/photos/32780784/pexels-photo-32780784.jpeg?w=500&h=900&fit=crop',
    video: '',
  },
  {
    id: 'brocade-potli-clutch',
    name: 'Brocade Potli Clutch',
    price: '₹2,800',
    poster: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?w=500&h=900&fit=crop',
    video: '',
  },
  {
    id: 'chanderi-anarkali-set',
    name: 'Chanderi Anarkali Suit Set',
    price: '₹6,200',
    poster: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?w=500&h=900&fit=crop',
    video: '',
  },
];

function WatchShopCard({ item, index }: { item: WatchShopItem; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mobilePlaying, setMobilePlaying] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [inView, setInView] = useState(false);
  const isUnreliable = /videos\.pexels\.com/i.test(item.video) || /pexels\.com\/video-files/i.test(item.video);
  const hasVideo = !!item.video && !hasVideoError && !isUnreliable;

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !hasVideo) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { rootMargin: '200px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasVideo]);

  useEffect(() => { setHasVideoError(false); }, [item.video]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!hasVideo || !inView) return;
    const v = videoRef.current;
    if (v) { v.muted = true; v.play().catch(() => {}); }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  };

  const handleMobileTap = () => {
    if (!hasVideo || !inView) return;
    if (!mobilePlaying) { setMobilePlaying(true); videoRef.current?.play().catch(() => {}); }
  };

  return (
    <motion.div
      ref={cardRef as any}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleMobileTap}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '9 / 16',
        background: '#1a1a1a',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 350ms ease',
        transformOrigin: 'center center',
      }}
    >
      {hasVideo && inView ? (
        <video
          ref={videoRef}
          src={resolveUploadUrl(item.video)}
          poster={resolveUploadUrl(item.poster)}
          muted
          playsInline
          loop
          preload="metadata"
          crossOrigin="anonymous"
          onError={() => setHasVideoError(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
        />
      ) : null}

      {/* Poster image (visible when not hovered) */}
      <img
        src={resolveUploadUrl(item.poster)}
        alt={item.name}
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
        width={500}
        height={900}
        onError={(e) => { const t = e.target as HTMLImageElement; if (!t.dataset.fallback) { t.dataset.fallback = '1'; t.src = fallbackWatchShopItems[0].poster; } }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: hasVideo && inView && isHovered ? 0 : 1,
          transition: 'opacity 400ms ease',
          aspectRatio: '9 / 16',
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Play icon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          animate={{ opacity: isHovered ? 0 : 1, scale: isHovered ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '18px solid var(--maroon)',
              borderTop: '11px solid transparent',
              borderBottom: '11px solid transparent',
              marginLeft: 4,
            }}
          />
        </motion.div>
      </div>

      {/* Product info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1.5rem 1.25rem 1.25rem',
          color: '#fff',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            lineHeight: 1.3,
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.85rem',
            color: 'var(--gold-soft)',
            marginTop: '0.3rem',
            fontWeight: 500,
          }}
        >
          PRICE: {item.price}
        </div>
        <Link
          to={`/product/${item.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-block',
            marginTop: '0.85rem',
            padding: '0.55rem 1.4rem',
            borderRadius: 30,
            background: 'linear-gradient(135deg, var(--maroon) 0%, var(--maroon-deep) 100%)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            pointerEvents: 'auto',
            boxShadow: '0 2px 12px rgba(107,30,35,0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(107,30,35,0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(107,30,35,0.4)';
          }}
        >
          Shop →
        </Link>
      </div>
    </motion.div>
  );
}

function WatchShopSection() {
  const [watchShopItems, setWatchShopItems] = useState<WatchShopItem[]>(fallbackWatchShopItems);

  useEffect(() => {
    api.watchshop.getActive().then((data) => {
      if (data.length > 0) {
        setWatchShopItems(data.map((item) => ({
          id: item.productId || item.id,
          name: item.name,
          price: item.price,
          poster: item.poster,
          video: item.video,
        })));
      }
    }).catch(() => {});
  }, []);

  return (
    <section style={{ padding: '4.5rem 0', background: 'var(--ivory)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <span className="eyebrow">Watch & Experience</span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.4rem', fontStyle: 'italic' }}>Watch &amp; Shop</h2>
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
              transformOrigin: 'center',
            }}
          />
        </motion.div>

        <div
          className="watch-shop-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
          }}
        >
          {watchShopItems.map((item, i) => (
            <WatchShopCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface HomeProps {
  likedProducts: string[];
  onToggleLike: (id: string) => void;
}

function HomeBubble({ delay, x, size, color }: { delay: number; x: number; size: number; color: string }) {
  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
      animate={{ y: '-10vh', opacity: [0, 0.6, 0.6, 0], scale: [0.5, 1, 1.1, 0.8] }}
      transition={{
        duration: 10 + Math.random() * 6,
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
        background: color,
        pointerEvents: 'none',
        filter: `blur(${size > 8 ? 2 : 0}px)`,
      }}
    />
  );
}

export default function Home({ likedProducts, onToggleLike }: HomeProps) {
  const [activeFilter, setActiveFilter] = useState<'new' | 'best' | 'featured'>('new');
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductType[]>(localProducts);
  const [fixedBanners, setFixedBanners] = useState<any[]>([]);
  const [fixedIndex, setFixedIndex] = useState(0);
  const [weaver, setWeaver] = useState<any>(null);
  const [curated, setCurated] = useState<any[] | null>(null);

  useEffect(() => {
    api.products.getAll().then((apiProducts) => {
      if (apiProducts.length === 0) return;
      setProducts(apiProducts);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    api.ads.getActive().then((ads) => {
      const fixed = ads.filter((ad) => ad.type === 'fixed' && ad.position !== 'sidebar' && ad.image).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (fixed.length > 0) setFixedBanners(fixed);
    }).catch(() => {});
    api.weaverStory.get().then(setWeaver).catch(() => {});
    api.curatedEdits.getActive().then((d) => { if (d.length) setCurated(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (fixedBanners.length <= 1) return;
    const id = setInterval(() => setFixedIndex((i) => (i + 1) % fixedBanners.length), 4000);
    return () => clearInterval(id);
  }, [fixedBanners.length]);

  useEffect(() => {
    const el = document.querySelector('.home-marquee-track') as HTMLElement | null;
    if (!el) return;
    const parent = document.querySelector('.home-marquee') as HTMLElement | null;
    if (!parent) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      }
    }, { threshold: 0 });
    io.observe(parent);
    return () => io.disconnect();
  }, []);

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
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Floating home bubbles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <HomeBubble
            key={i}
            delay={i * 0.4}
            x={1 + (i * 1.25) % 100}
            size={4 + (i % 6) * 3}
            color={`rgba(183,148,88,${0.1 + (i % 5) * 0.04})`}
          />
        ))}
      </div>

      <Hero />

      {/* ─── Offer Marquee ─── */}
      <div
        className="home-marquee"
        style={{
          background: 'var(--maroon)',
          overflow: 'hidden',
          padding: '0.85rem 0',
        }}
      >
        <div
          className="home-marquee-track"
          style={{
            display: 'inline-flex',
            whiteSpace: 'nowrap',
            flexWrap: 'nowrap',
            width: 'max-content',
            minWidth: '200%',
            animation: 'marquee 30s linear infinite',
            willChange: 'transform',
            transform: 'translate3d(0,0,0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {[...Array(6)].map((_, i) => (
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
                flexShrink: 0,
                display: 'inline-block',
              }}
            >
              ✦ Free Shipping on Orders Above ₹2999 &nbsp;&nbsp;&nbsp;
              ✦ New Suit Set Collection Out Now &nbsp;&nbsp;&nbsp;
              ✦ Handwoven authenticity guaranteed &nbsp;&nbsp;&nbsp;
              ✦ Easy 7-Day Returns &nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-33.33%,0,0); }
        }
        .home-marquee-track { animation-play-state: running !important; transform: translate3d(0,0,0); }
        @media (max-width: 768px) {
          .home-marquee-track { animation: marquee 30s linear infinite !important; will-change: transform; }
        }
        @media (min-width: 769px) {
          .home-marquee-track { animation: marquee 30s linear infinite !important; }
        }
        @media (max-width: 768px) {
          .weaver-text {
            text-align: center !important;
            align-items: center !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .weaver-text p {
            margin-left: auto !important;
            margin-right: auto !important;
            text-align: center !important;
          }
          .weaver-text h2 {
            text-align: center !important;
          }
          .weaver-text > div {
            justify-content: center !important;
          }
          .weaver-text div[style*="60px"] {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .curated-overlay {
            text-align: center !important;
            align-items: center !important;
            display: flex !important;
            flex-direction: column !important;
            left: 1rem !important;
            right: 1rem !important;
          }
          .curated-overlay p {
            margin-left: auto !important;
            margin-right: auto !important;
            text-align: center !important;
          }
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
            className="weaver-text"
            style={{ flex: '1 1 320px' }}
          >
            <span className="eyebrow">{weaver?.eyebrow || 'By Hand, By Name'}</span>
            <DecorativeLine />
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '2rem', marginTop: '0.8rem', fontStyle: 'italic' }}
            >
              {weaver?.title || 'Every saree is signed by the loom that made it.'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              style={{ color: 'var(--ink-soft)', lineHeight: 1.8, marginTop: '1rem', maxWidth: 480 }}
            >
              {weaver?.description || 'We work directly with 40 weaving families across Kanchipuram, Banaras, Chanderi and rural Bengal. No middle warehouses, no mass reproduction — a saree isn\'t cut from a bolt here, it\'s finished only when you order it.'}
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
              <Link to={weaver?.buttonLink || '/shop'} className="btn btn-solid">
                {weaver?.buttonText || 'Meet the Weaves →'}
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
              height: 'clamp(300px, 50vw, 480px)',
            }}
          >
            {/* Left image — larger, main */}
            <TiltImage
              src={resolveUploadUrl(weaver?.image1) || 'https://images.pexels.com/photos/19567892/pexels-photo-19567892.jpeg?w=500&h=650&fit=crop'}
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
              src={resolveUploadUrl(weaver?.image2) || 'https://images.pexels.com/photos/5585346/pexels-photo-5585346.jpeg?w=500&h=650&fit=crop'}
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

      {/* ─── Banner Section — Fixed Ad Carousel ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="fixed-banner-section"
        style={{
          position: 'relative',
          height: 'clamp(280px, 50vh, 420px)',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        {(fixedBanners.length ? fixedBanners : [{ image: '', link: '', offer: '' }]).map((banner, idx) => {
          const active = fixedBanners.length ? idx === fixedIndex : true;
          const img = banner.image || 'https://images.pexels.com/photos/27155546/pexels-photo-27155546.jpeg?w=1920&h=600&fit=crop';
          return (
            <div key={idx} style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: 'opacity 0.7s ease', pointerEvents: active ? 'auto' : 'none' }}>
              <img src={resolveUploadUrl(img)} alt="Village Allure promotional banner" loading="lazy" decoding="async" crossOrigin="anonymous" width={1920} height={600} onError={(e) => { const t = e.target as HTMLImageElement; if (!t.dataset.fallback) { t.dataset.fallback='1'; t.src='https://images.pexels.com/photos/27155546/pexels-photo-27155546.jpeg?w=1920&h=600&fit=crop'; } }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '1920 / 600' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(36,27,21,0.35) 0%, rgba(36,27,21,0.25) 100%)' }} />
              {(banner as any).offer && (
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 2, background: 'var(--gold)', color: 'var(--ink)', padding: '0.5rem 1.2rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 4px 18px rgba(0,0,0,0.25)' }}>
                  {(banner as any).offer}
                </div>
              )}
              {banner.link && <Link to={banner.link} style={{ position: 'absolute', inset: 0, zIndex: 1 }} aria-label="Fixed banner link" />}
            </div>
          );
        })}
        {fixedBanners.length > 1 && (
          <>
            <button onClick={() => setFixedIndex((i) => (i - 1 + fixedBanners.length) % fixedBanners.length)} aria-label="Previous banner" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>‹</button>
            <button onClick={() => setFixedIndex((i) => (i + 1) % fixedBanners.length)} aria-label="Next banner" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>›</button>
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', gap: '0.5rem' }}>
              {fixedBanners.map((_, i) => (
                <button key={i} onClick={() => setFixedIndex(i)} aria-label={`Go to banner ${i + 1}`} style={{ width: fixedIndex === i ? 22 : 8, height: 8, borderRadius: 99, border: 'none', background: fixedIndex === i ? 'var(--gold)' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
              ))}
            </div>
          </>
        )}
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
        >
          {filteredProducts.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              style={{ display: 'flex', height: '100%', minWidth: 0 }}
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
            { label: 'Years of Craft', value: 6 },
            { label: 'Weaving Families', value: 15 },
            { label: 'Happy Customers', value: 3000},
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ textAlign: 'center', color: 'var(--ivory)' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 500, color: 'var(--gold-soft)' }}>
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

      {/* ─── Watch & Shop ─── */}
      <WatchShopSection />

      {/* ─── Testimonials ─── */}
      <Testimonials />

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
          {(curated && curated.length > 0 ? curated : [
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
          ]).map((edit: any, i: number) => (
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
                src={resolveUploadUrl(edit.image)}
                alt={edit.title}
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
                width={900}
                height={700}
                onError={(e) => { const t = e.target as HTMLImageElement; if (!t.dataset.fallback) { t.dataset.fallback='1'; t.src='https://images.pexels.com/photos/30677843/pexels-photo-30677843.jpeg?w=900&h=700&fit=crop'; } }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '900 / 700' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(0deg, rgba(36,27,21,0.82) 0%, rgba(36,27,21,0.15) 50%, transparent 80%)',
                }}
              />
              <div className="curated-overlay" style={{ position: 'absolute', left: '1.75rem', right: '1.75rem', bottom: '1.75rem', color: 'var(--ivory)' }}>
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
