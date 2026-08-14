import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ZariDivider from '../components/ZariDivider';

export default function Orders() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('reshamUser');
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: '72vh', padding: '4rem 1.5rem' }}
    >
      <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your purchases
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{ fontSize: '2rem', marginTop: '0.5rem', fontStyle: 'italic' }}
          >
            My Orders
          </motion.h1>
          <ZariDivider />
        </div>

        <div
          style={{
            background: 'var(--ivory)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', display: 'block' }}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>No orders yet</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Start shopping to see your orders here.</p>
          <Link to="/shop" className="btn btn-solid" style={{ padding: '0.8rem 2rem', fontSize: '0.82rem', textDecoration: 'none' }}>
            Browse Collection
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
