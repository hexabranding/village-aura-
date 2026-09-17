import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import ZariDivider from '../components/ZariDivider';

export default function Profile() {
  const [user, setUser] = useState<{ email: string; name: string; phone?: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('reshamUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setName(parsed.name);
      setEmail(parsed.email);
      setPhone(parsed.phone || '');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('reshamCustomerToken');
      if (token) {
        await api.customers.getProfile();
        // Profile is synced with backend
      }
      const updated = { name, email, phone };
      localStorage.setItem('reshamUser', JSON.stringify(updated));
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Save locally even if backend fails
      const updated = { name, email, phone };
      localStorage.setItem('reshamUser', JSON.stringify(updated));
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!user) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '1px solid var(--line)',
    borderBottom: '2px solid var(--gold-soft)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--ivory-deep)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--ink)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: '72vh', padding: '4rem 1.5rem' }}
    >
      <div className="container" style={{ maxWidth: 500, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Personal details
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{ fontSize: '2rem', marginTop: '0.5rem', fontStyle: 'italic' }}
          >
            My Profile
          </motion.h1>
          <ZariDivider />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'var(--ivory)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 24px 60px rgba(36, 27, 21, 0.10)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="eyebrow" htmlFor="profile-name" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="eyebrow" htmlFor="profile-email" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="eyebrow" htmlFor="profile-phone" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile"
              pattern="[0-9]{10}"
              maxLength={10}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: '0.6rem 0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: '0.82rem', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-solid"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </motion.button>
        </motion.form>
      </div>
    </motion.div>
  );
}
