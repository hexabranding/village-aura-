import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ZariDivider from '../components/ZariDivider';
import { products } from '../data/products';

interface ShopProps {
  likedProducts: string[];
  onToggleLike: (id: string) => void;
}

const SUBCATS: Record<string, string[]> = {
  Sarees: ['Ajrakh Cotton', 'Chanderi Silk', 'Maheshwari Silk', 'Kota Doria', 'Kota Cotton', 'Kalamkari'],
  Jewellery: ['Necklaces', 'Earrings', 'Bangles', 'Hair Jewellery'],
};

export default function Shop({ likedProducts, onToggleLike }: ShopProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const activeSub = activeCategory && SUBCATS[activeCategory] ? searchParams.get('sub') : null;

  const filtered = products.filter(
    (p) =>
      (!activeCategory || p.category === activeCategory) &&
      (!activeSub || p.subCategory === activeSub)
  );

  const subcats = activeCategory ? SUBCATS[activeCategory] : undefined;

  const setSub = (sub: string | null) => {
    if (!activeCategory) return;
    if (sub) setSearchParams({ category: activeCategory, sub });
    else setSearchParams({ category: activeCategory });
  };

  return (
    <div className="container" style={{ padding: '3rem 0 5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="eyebrow">The Full Collection</span>
        <h1 style={{ fontSize: '2.6rem', marginTop: '0.4rem', fontStyle: 'italic' }}>
          {activeCategory ?? 'All Products'}
        </h1>
      </div>

      <ZariDivider />

      {subcats && (
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            margin: '2rem 0 2.5rem',
          }}
        >
          <button
            onClick={() => setSub(null)}
            className="eyebrow category-pill"
            style={{
              border: '1px solid var(--gold)',
              background: !activeSub ? 'var(--gold)' : 'transparent',
              color: !activeSub ? 'var(--ivory)' : 'var(--gold)',
              padding: '0.55rem 1.1rem',
              fontSize: '0.62rem',
            }}
          >
            All {activeCategory}
          </button>
          {subcats.map((sub) => (
            <button
              key={sub}
              onClick={() => setSub(sub)}
              className="eyebrow category-pill"
              style={{
                border: '1px solid var(--gold)',
                background: activeSub === sub ? 'var(--gold)' : 'transparent',
                color: activeSub === sub ? 'var(--ivory)' : 'var(--gold)',
                padding: '0.55rem 1.1rem',
                fontSize: '0.62rem',
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory ?? 'all'}-${activeSub ?? 'all'}`}
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
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              isLiked={likedProducts.includes(p.id)}
              onToggleLike={onToggleLike}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
          No products found in this category yet.
        </p>
      )}
    </div>
  );
}
