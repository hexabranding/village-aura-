import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import logo from '../assets/images/logo.png';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--ivory-deep) 0%, #f5ede3 50%, var(--ivory) 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,30,35,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <img src={logo} alt="Resham" style={{ height: 72, width: 'auto', margin: '0 auto 1.25rem' }} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{
              fontSize: '1.6rem',
              fontStyle: 'italic',
              color: 'var(--maroon-deep)',
              fontFamily: 'var(--font-display)',
              marginBottom: '0.35rem',
            }}
          >
            Admin Panel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}
          >
            Sign in to manage your store
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            background: 'var(--ivory)',
            padding: '2.25rem 2rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
            boxShadow: '0 12px 40px rgba(36,27,21,0.08), 0 2px 8px rgba(36,27,21,0.04)',
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1rem' }}>⚠</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--ink-soft)',
                marginBottom: '0.4rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  border: '1px solid var(--line)',
                  borderBottom: '2px solid var(--gold-soft)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--ivory-deep)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.92rem',
                  color: 'var(--ink)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderBottomColor = 'var(--maroon)';
                  e.currentTarget.style.boxShadow = '0 2px 0 0 var(--maroon)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderBottomColor = 'var(--gold-soft)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--ink-soft)',
                marginBottom: '0.4rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '0.8rem 2.75rem 0.8rem 1rem',
                    border: '1px solid var(--line)',
                    borderBottom: '2px solid var(--gold-soft)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--ivory-deep)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.92rem',
                    color: 'var(--ink)',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderBottomColor = 'var(--maroon)';
                    e.currentTarget.style.boxShadow = '0 2px 0 0 var(--maroon)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderBottomColor = 'var(--gold-soft)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--ink-soft)',
                    padding: '0.25rem',
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-solid"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.9rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--ink-soft)' }}
        >
          <a href="/" style={{ color: 'var(--maroon)', textDecoration: 'underline', transition: 'color 0.2s' }}>
            ← Back to Store
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
