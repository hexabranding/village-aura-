import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ZariDivider from '../components/ZariDivider';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('reshamUser', JSON.stringify({ email, name: name || email.split('@')[0] || 'Member' }));
    navigate('/');
  };

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
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        minHeight: '72vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'var(--ivory)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 24px 60px rgba(36, 27, 21, 0.10)',
          width: '100%',
          maxWidth: 440,
          padding: '2.75rem 2.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join Village Allure
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{ fontSize: '2rem', marginTop: '0.5rem', fontStyle: 'italic' }}
          >
            Create Account
          </motion.h1>
          <ZariDivider />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', marginTop: '0.2rem' }}
          >
            Sign up to track orders and save your favourite weaves.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label className="eyebrow" htmlFor="signup-name" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.48 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label className="eyebrow" htmlFor="signup-email" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.56 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
          >
            <label className="eyebrow" htmlFor="signup-password" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={showPassword ? 'var(--maroon)' : '#8a8a8a'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.62 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ accentColor: 'var(--maroon)', width: 15, height: 15 }}
            />
            <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
              I agree to the{' '}
              <span style={{ color: 'var(--maroon)', fontWeight: 600, borderBottom: '1px solid var(--gold)', cursor: 'pointer' }}>Terms & Conditions</span>
            </span>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-solid"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.85rem' }}
          >
            Create Account
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-soft)' }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--maroon)', fontWeight: 600, borderBottom: '1px solid var(--gold)' }}>
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
