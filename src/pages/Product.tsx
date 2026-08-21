import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, products as localProducts } from '../data/products';
import Accordion from '../components/Accordion';
import ProductCard from '../components/ProductCard';
import ZariDivider from '../components/ZariDivider';
import { api } from '../lib/api';
import type { Product as ProductType } from '../data/products';

interface ProductProps {
  onAddToBag: (productId: string, colorIndex: number, qty: number) => void;
  likedProducts: string[];
  onToggleLike: (id: string) => void;
}

const ZOOM_LEVEL = 2.8;
const LENS_SIZE = 150;

export default function Product({ onAddToBag, likedProducts, onToggleLike }: ProductProps) {
  const { id } = useParams();
  const [allProducts, setAllProducts] = useState<ProductType[]>(localProducts);
  const product = useMemo(() => {
    if (id) {
      return allProducts.find((p) => p.id === id) ?? getProduct(id);
    }
    return undefined;
  }, [id, allProducts]);

  useEffect(() => {
    api.products.getAll().then((apiProducts) => {
      if (apiProducts.length === 0) return;
      const merged = localProducts.map((lp) => {
        const apiP = apiProducts.find((p) => p.id === lp.id);
        if (apiP && apiP.variants.some((v) => v.images.length > 0)) return apiP;
        return lp;
      });
      const newProducts = apiProducts.filter((p) => !localProducts.some((lp) => lp.id === p.id));
      setAllProducts([...merged, ...newProducts]);
    }).catch(() => {});
  }, []);

  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [mobileZoom, setMobileZoom] = useState(false);
  const [bagQty, setBagQty] = useState(0);
  const [alreadyAdded, setAlreadyAdded] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Zoom state
  const [hovering, setHovering] = useState(false);
  const [zoomBgPos, setZoomBgPos] = useState({ x: 50, y: 50 });
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const related = useMemo(
    () =>
      product
        ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
        : [],
    [product, allProducts]
  );

  const syncZoom = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const px = Math.min(Math.max((x / w) * 100, 0), 100);
    const py = Math.min(Math.max((y / h) * 100, 0), 100);

    setZoomBgPos({ x: px, y: py });

    const half = LENS_SIZE / 2;
    const lx = Math.min(Math.max(x, half), w - half);
    const ly = Math.min(Math.max(y, half), h - half);
    setLensPos({ x: lx, y: ly });
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setHovering(true);
    syncZoom(e);
  }, [syncZoom]);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  if (!product) return <Navigate to="/shop" replace />;

  const variant = product.variants[variantIndex];
  const currentImageSrc = variant.images[imageIndex];

  const handleAdd = () => {
    if (added) {
      setAlreadyAdded(true);
      setTimeout(() => setAlreadyAdded(false), 2000);
      return;
    }
    onAddToBag(product.id, variantIndex, 1);
    setBagQty((prev) => prev + 1);
    setAdded(true);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 0 5rem' }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginBottom: '2rem' }}>
        <Link to="/">Home</Link> &nbsp;/&nbsp; <Link to="/shop">Shop</Link> &nbsp;/&nbsp;{' '}
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>{' '}
        &nbsp;/&nbsp; <span style={{ color: 'var(--ink)' }}>{product.name}</span>
      </div>

      <div
        className="product-detail-grid"
        style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(2rem, 5vw, 4rem)' }}
      >
        {/* Gallery */}
        <div className="gallery-sticky" style={{ position: 'sticky', top: '100px', alignSelf: 'start', overflow: 'visible' }}>
          <div className="gallery-inner" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
            {/* Main image with zoom */}
            <div
              ref={containerRef}
              className="product-zoom-container"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={syncZoom}
              onClick={() => !hovering && setMobileZoom(true)}
              style={{
                position: 'relative',
                aspectRatio: '4/5',
                overflow: 'hidden',
                background: 'var(--ivory-deep)',
                borderRadius: 'var(--radius)',
                cursor: hovering ? 'none' : 'zoom-in',
                flex: '1 1 0%',
                minWidth: 0,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${variantIndex}-${imageIndex}`}
                  src={currentImageSrc}
                  alt={`${product.name} — ${variant.colorName}`}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
              </AnimatePresence>

              {/* Lens overlay */}
              {hovering && (
                <div
                  className="zoom-lens"
                  style={{
                    position: 'absolute',
                    width: LENS_SIZE,
                    height: LENS_SIZE,
                    left: lensPos.x,
                    top: lensPos.y,
                    transform: 'translate(-50%, -50%)',
                    border: '1.5px solid rgba(255,255,255,0.7)',
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.12)',
                    pointerEvents: 'none',
                    zIndex: 5,
                    transition: 'left 0.05s linear, top 0.05s linear',
                  }}
                />
              )}

              {/* Zoom hint */}
              {!hovering && (
                <div
                  className="zoom-hint"
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    background: 'rgba(36,27,21,0.6)',
                    color: 'var(--ivory)',
                    padding: '0.35rem 0.7rem',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                  </svg>
                  Hover to zoom
                </div>
              )}
            </div>

            {/* Zoom preview panel */}
            <div
              className="zoom-preview"
              style={{
                position: 'absolute',
                left: 'calc(100% + 1.5rem)',
                top: 0,
                width: 'min(42vw, 520px)',
                aspectRatio: '4/5',
                flex: '0 0 auto',
                overflow: 'hidden',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--line)',
                background: '#fff',
                boxShadow: '0 4px 24px rgba(36,27,21,0.10)',
                pointerEvents: 'none',
                opacity: hovering ? 1 : 0,
                visibility: hovering ? 'visible' : 'hidden',
                transition: 'opacity 0.25s ease, visibility 0.25s ease',
                backgroundImage: `url(${currentImageSrc})`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundPosition: `${zoomBgPos.x}% ${zoomBgPos.y}%`,
                backgroundRepeat: 'no-repeat',
                zIndex: 20,
              }}
            />
          </div>

          {/* Thumbnail rail */}
          <div className="thumb-rail gallery-thumbs" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {variant.images.map((src, i) => (
              <motion.img
                key={src}
                src={src}
                alt=""
                onClick={() => setImageIndex(i)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 70,
                  height: 88,
                  objectFit: 'cover',
                  border: i === imageIndex ? '1.5px solid var(--maroon)' : '1.5px solid transparent',
                  opacity: i === imageIndex ? 1 : 0.6,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="eyebrow">{product.fabric}</span>
          <h1 style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', marginTop: '0.5rem', fontStyle: 'italic' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginTop: '1rem' }}>
            <span style={{ fontSize: '1.6rem', color: 'var(--maroon)', fontWeight: 700 }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp && (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--ink-soft)' }}>
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                <span className="eyebrow" style={{ color: 'var(--teal)' }}>
                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>

          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.8, marginTop: '1.25rem', maxWidth: 460 }}>
            {product.description}
          </p>

          {/* Color / weave variant selector */}
          <div style={{ marginTop: '2rem' }}>
            <div className="eyebrow" style={{ marginBottom: '0.75rem' }}>
              Colourway — {variant.colorName}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {product.variants.map((v, i) => (
                <motion.button
                  key={v.colorName}
                  onClick={() => {
                    setVariantIndex(i);
                    setImageIndex(0);
                    setAdded(false);
                    setAlreadyAdded(false);
                  }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label={v.colorName}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: v.hex,
                    border:
                      i === variantIndex ? '2px solid var(--maroon)' : '2px solid transparent',
                    outlineOffset: 2,
                    boxShadow: '0 0 0 1px var(--line)',
                  }}
                />
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.96 }}
            className="btn btn-solid"
            style={{ width: '100%', justifyContent: 'center', marginTop: '2.25rem', padding: '1.05rem' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  Added to Bag
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  Add to Bag
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {alreadyAdded && (
            <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
              Already added to bag
            </div>
          )}

          {!alreadyAdded && bagQty > 0 && (
            <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>
              Added to bag
            </div>
          )}

          {/* Social share icons — mobile only */}
          <div
            className="product-social-share"
            style={{
              display: 'none',
              gap: '0.75rem',
              justifyContent: 'center',
              marginTop: '1rem',
            }}
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this ${product.name} from Village Aura!\n\n₹${product.price.toLocaleString('en-IN')}\n\n${window.location.origin}/product/${product.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid #25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#25D366',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Instagram"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid #E4405F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E4405F',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href={`https://www.youtube.com/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on YouTube"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1.5px solid #FF0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF0000',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>

          {/* WhatsApp Share Button */}
          <motion.a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out this ${product.name} from Village Aura!\n\n₹${product.price.toLocaleString('en-IN')}\n\n${window.location.origin}/product/${product.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              width: '100%',
              marginTop: '0.75rem',
              padding: '0.9rem',
              borderRadius: 'var(--radius)',
              border: '1.5px solid #25D366',
              background: 'transparent',
              color: '#25D366',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s ease, color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#25D366';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#25D366';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Share on WhatsApp
          </motion.a>

          <div style={{ marginTop: '2.5rem' }}>
            <Accordion
              items={[
                {
                  title: product.category === 'Jewellery' || product.category === 'Bags' ? 'Piece Details' : 'Weave Details',
                  content: (
                    <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                      {product.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: 'Fabric & Care',
                  content: (
                    <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                      {product.care.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: 'Shipping & Returns',
                  content:
                    'Ships in 3–5 business days, made-to-order pieces in 10–14 days. Easy returns within 7 days of delivery for unworn, tag-intact sarees.',
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Mobile zoom modal */}
      <AnimatePresence>
        {mobileZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMobileZoom(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(36,27,21,0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
            }}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.15 }}
              onClick={() => setMobileZoom(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'var(--ivory)',
                width: 40,
                height: 40,
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                zIndex: 101,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close zoom"
            >
              ✕
          </motion.button>
            <motion.img
              src={currentImageSrc}
              alt={`${product.name} — ${variant.colorName}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                maxWidth: '92vw',
                maxHeight: '88vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.12)',
                color: 'var(--ivory)',
                padding: '0.4rem 1rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.1em',
              }}
            >
              {imageIndex + 1} / {variant.images.length}
            </div>

            {variant.images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndex((prev) => (prev === 0 ? variant.images.length - 1 : prev - 1));
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: 'var(--ivory)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndex((prev) => (prev === variant.images.length - 1 ? 0 : prev + 1));
                  }}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: 'var(--ivory)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Next image"
                >
                  ›
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {related.length > 0 && (
        <section style={{ marginTop: '5.5rem' }}>
          <ZariDivider />
          <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
            <span className="eyebrow">You May Also Like</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.4rem' }}>More from {product.category}</h2>
          </div>
          <div
            className="shop-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem 1.5rem' }}
          >
            {related.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                isLiked={likedProducts.includes(p.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
