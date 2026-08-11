import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const primary = product.variants[0];
  const secondaryImage = primary.images[1] ?? primary.images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      <Link
        to={`/product/${product.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: 'block' }}
      >
        <motion.div
          animate={{ y: hovered ? -6 : 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--ivory-deep)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              aspectRatio: '4 / 5',
            }}
          >
            <motion.img
              src={primary.images[0]}
              alt={product.name}
              animate={{ opacity: hovered ? 0 : 1, scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <motion.img
              src={secondaryImage}
              alt=""
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Quick view overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(36,27,21,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={hovered ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={{
                  background: 'var(--ivory)',
                  color: 'var(--maroon)',
                  padding: '0.5rem 1.2rem',
                  fontSize: '0.7rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                }}
              >
                Quick View
              </motion.span>
            </motion.div>

            {product.mrp && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="eyebrow"
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: 'var(--maroon)',
                  color: 'var(--ivory)',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
              </motion.span>
            )}
          </div>

          <div style={{ padding: '1rem 0.25rem 0.75rem' }}>
            <div className="eyebrow" style={{ color: 'var(--ink-soft)', marginBottom: '0.3rem' }}>
              {product.fabric}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.3 }}>{product.name}</h3>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', marginTop: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.55rem',
                  fontWeight: 600,
                  color: 'var(--maroon)',
                  letterSpacing: '-0.01em',
                }}
              >
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp && (
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--ink-soft)',
                    textDecoration: 'line-through',
                    opacity: 0.6,
                  }}
                >
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
