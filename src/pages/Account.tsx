import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ZariDivider from '../components/ZariDivider';

export default function Account() {
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
            Welcome back
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{ fontSize: '2rem', marginTop: '0.5rem', fontStyle: 'italic' }}
          >
            My Account
          </motion.h1>
          <ZariDivider />
        </div>

        <div
          style={{
            background: 'var(--ivory)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>Name</label>
              <p style={{ fontSize: '1rem', marginTop: '0.3rem', color: 'var(--ink)' }}>{user.name}</p>
            </div>
            <div>
              <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>Email</label>
              <p style={{ fontSize: '1rem', marginTop: '0.3rem', color: 'var(--ink)' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', marginTop: '2rem', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-solid" style={{ padding: '0.8rem 1.5rem', fontSize: '0.82rem', textDecoration: 'none' }}>
              View Orders
            </Link>
            <Link to="/profile" className="btn btn-solid" style={{ padding: '0.8rem 1.5rem', fontSize: '0.82rem', textDecoration: 'none' }}>
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
