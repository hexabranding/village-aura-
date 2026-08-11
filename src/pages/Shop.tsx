import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ZariDivider from '../components/ZariDivider';
import { products, categories } from '../data/products';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const setCategory = (cat: string | null) => {
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '3rem 0 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="eyebrow">The Full Collection</span>
        <h1 style={{ fontSize: '2.6rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
          {activeCategory ?? 'All Sarees'}
        </h1>
      </div>

      <ZariDivider />

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          margin: '2rem 0 3rem',
        }}
      >
        <button
          onClick={() => setCategory(null)}
          className="eyebrow category-pill"
          style={{
            border: '1px solid var(--maroon)',
            background: !activeCategory ? 'var(--maroon)' : 'transparent',
            color: !activeCategory ? 'var(--ivory)' : 'var(--maroon)',
            padding: '0.7rem 1.4rem',
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="eyebrow category-pill"
            style={{
              border: '1px solid var(--maroon)',
              background: activeCategory === cat ? 'var(--maroon)' : 'transparent',
              color: activeCategory === cat ? 'var(--ivory)' : 'var(--maroon)',
              padding: '0.7rem 1.4rem',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory ?? 'all'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="shop-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem 1.5rem',
          }}
        >
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
          No sarees found in this category yet.
        </p>
      )}
    </div>
  );
}
