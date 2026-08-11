import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/logo.png';

interface HeaderProps {
  cartCount: number;
}

export default function Header({ cartCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Silk Sarees', to: '/shop?category=Silk%20Sarees' },
    { label: 'Handwoven', to: '/shop?category=Handwoven' },
    { label: 'Bridal', to: '/shop?category=Bridal' },
    { label: 'Cotton', to: '/shop?category=Cotton%20Sarees' },
    { label: 'Ornaments', to: '/shop?category=Ornaments' },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100px',
        }}
      >
        {/* Left — hamburger on mobile */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            display: 'none',
            flexDirection: 'column',
            gap: 6,
            padding: 10,
          }}
          className="menu-toggle"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            style={{ width: 26, height: 2.5, background: '#1a1a1a', display: 'block' }}
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            style={{ width: 26, height: 2.5, background: '#1a1a1a', display: 'block' }}
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            style={{ width: 26, height: 2.5, background: '#1a1a1a', display: 'block' }}
          />
        </button>

        {/* Center — logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={logo}
            alt="Village Allure"
            style={{ height: 145, width: 'auto' }}
          />
        </Link>

        {/* Right — nav + cart */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.2rem' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '2.2rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="nav-link"
                style={{
                  color: '#1a1a1a',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link to="/shop" aria-label="Cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="26" viewBox="0 0 20 22" fill="none">
              <path
                d="M4 6h12l1 14H3L4 6Z"
                stroke="#1a1a1a"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M7 6a3 3 0 0 1 6 0" stroke="#1a1a1a" strokeWidth="1.8" />
            </svg>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -10,
                    background: 'var(--maroon)',
                    color: 'var(--ivory)',
                    borderRadius: '50%',
                    width: 17,
                    height: 17,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--line)' }}
          >
            <div
              className="container"
              style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem', gap: '1rem' }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="eyebrow"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--ink)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
