import { useMemo, useState, useRef, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, products } from '../data/products';
import Accordion from '../components/Accordion';
import ProductCard from '../components/ProductCard';
import ZariDivider from '../components/ZariDivider';

interface ProductProps {
  onAddToBag: (name: string) => void;
}

export default function Product({ onAddToBag }: ProductProps) {
  const { id } = useParams();
  const product = id ? getProduct(id) : undefined;

  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  // Zoom state
  const [hovering, setHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [mobileZoom, setMobileZoom] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const ZOOM = 2.5;
  const LENS_SIZE = 140;

  const related = useMemo(
    () =>
      product
        ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
        : [],
    [product]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;
    const pctY = y / rect.height;

    // Clamp lens to image bounds
    const halfLens = LENS_SIZE / 2;
    const clampedX = Math.max(halfLens, Math.min(rect.width - halfLens, x));
    const clampedY = Math.max(halfLens, Math.min(rect.height - halfLens, y));

    setLensPos({ x: clampedX, y: clampedY });
    setZoomPos({ x: pctX, y: pctY });
  }, []);

  if (!product) return <Navigate to="/shop" replace />;

  const variant = product.variants[variantIndex];

  const handleAdd = () => {
    onAddToBag(product.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
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
        <div className="gallery-sticky" style={{ position: 'sticky', top: '100px', alignSelf: 'start' }}>
          {/* Main image with zoom */}
          <div
            ref={imageRef}
            className="product-zoom-container"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setMobileZoom(true)}
            style={{
              position: 'relative',
              aspectRatio: '4/5',
              overflow: 'hidden',
              background: 'var(--ivory-deep)',
              borderRadius: 'var(--radius)',
              cursor: hovering ? 'none' : 'zoom-in',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={`${variantIndex}-${imageIndex}`}
                src={variant.images[imageIndex]}
                alt={`${product.name} — ${variant.colorName}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
              />
            </AnimatePresence>

            {/* Lens overlay — desktop only */}
            {hovering && (
              <div
                className="zoom-lens"
                style={{
                  position: 'absolute',
                  width: LENS_SIZE,
                  height: LENS_SIZE,
                  left: lensPos.x - LENS_SIZE / 2,
                  top: lensPos.y - LENS_SIZE / 2,
                  border: '2px solid var(--maroon)',
                  background: 'rgba(107, 30, 35, 0.08)',
                  pointerEvents: 'none',
                  zIndex: 5,
                  borderRadius: '50%',
                  transition: 'left 0.05s ease-out, top 0.05s ease-out',
                }}
              />
            )}

            {/* Zoom hint icon */}
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

          {/* Zoom preview — desktop only */}
          <AnimatePresence>
            {hovering && (
              <motion.div
                className="zoom-preview"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 'calc(100% + 16px)',
                  width: 380,
                  height: 475,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--line)',
                  background: 'var(--ivory-deep)',
                  zIndex: 20,
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={variant.images[imageIndex]}
                  alt=""
                  style={{
                    position: 'absolute',
                    width: `${ZOOM * 100}%`,
                    height: `${ZOOM * 100}%`,
                    objectFit: 'cover',
                    objectPosition: `${zoomPos.x * 100}% ${zoomPos.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    left: `${zoomPos.x * 100}%`,
                    top: `${zoomPos.y * 100}%`,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thumbnail rail */}
          <div className="thumb-rail" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
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
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--maroon)' }}>
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
                  Added to Bag ✓
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

          <div style={{ marginTop: '2.5rem' }}>
            <Accordion
              items={[
                {
                  title: product.category === 'Ornaments' ? 'Piece Details' : 'Weave Details',
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
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

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
            {/* Close button */}
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
              src={variant.images[imageIndex]}
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

            {/* Image counter */}
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

            {/* Prev / Next arrows */}
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
    </div>
  );
}
