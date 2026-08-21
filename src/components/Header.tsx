import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/logo.png';
import { getProduct } from '../data/products';

interface HeaderProps {
  cartCount: number;
  likedCount: number;
  likedProducts: string[];
  onToggleLike: (id: string) => void;
}

export default function Header({ cartCount, likedCount, likedProducts, onToggleLike }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likedOpen, setLikedOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [userOpen, setUserOpen] = useState(false);
  const likedRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [loggedUser, setLoggedUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('reshamUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('reshamUser');
    setLoggedUser(null);
    setUserOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (likedRef.current && !likedRef.current.contains(e.target as Node)) {
        setLikedOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const likedItems = likedProducts
    .map((id) => getProduct(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const navLinks = [
    { label: 'Sarees', to: '/shop?category=Sarees', subs: ['Ajrakh Cotton', 'Chanderi Silk', 'Maheshwari Silk', 'Kota Doria', 'Kota Cotton', 'Kalamkari'] },
    { label: 'Jewellery', to: '/shop?category=Jewellery', subs: ['Necklaces', 'Earrings', 'Bangles', 'Hair Jewellery'] },
    { label: 'Bags', to: '/shop?category=Bags' },
    { label: 'Suit Sets', to: '/shop?category=Unstitched%20Suit%20Sets' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Contact', to: '/contact' },
    
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
          height: 'clamp(60px, 10vw, 100px)',
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
            className="header-logo"
            style={{ height: 'clamp(50px, 12vw, 145px)', width: 'auto' }}
          />
        </Link>

        {/* Right — nav + user + cart */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
          <div className="nav-links" style={{ display: 'flex', gap: '2.2rem' }}>
            {navLinks.map((link) => (
              <div
                key={link.label}
                onMouseEnter={() => setHoveredNav(link.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{ position: 'relative' }}
              >
                <Link
                  to={link.to}
                  className="nav-link"
                  style={{
                    color: 'var(--ink)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-body)',
                    position: 'relative',
                    padding: '4px 0',
                  }}
                >
                  {link.label}
                  {link.subs && (
                    <span style={{ fontSize: '0.6rem', marginLeft: '0.25rem', color: 'var(--maroon)' }}>▾</span>
                  )}
                </Link>

                {link.subs && (
                  <>
                    {/* Bridge element to prevent dropdown from closing */}
                    {hoveredNav === link.label && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          height: 12,
                          zIndex: 69,
                        }}
                      />
                    )}
                    <AnimatePresence>
                      {hoveredNav === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            minWidth: 230,
                            background: 'var(--ivory)',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--radius)',
                            boxShadow: '0 20px 50px rgba(36,27,21,0.15)',
                            padding: '0.6rem',
                            zIndex: 70,
                          }}
                        >
                        {link.subs.map((sub) => (
                          <Link
                            key={sub}
                            to={`${link.to.split('&')[0]}&sub=${encodeURIComponent(sub)}`}
                            className="eyebrow"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.72rem 0.9rem',
                              color: 'var(--ink)',
                              fontSize: '0.68rem',
                              letterSpacing: '0.12em',
                              borderRadius: 'var(--radius-sm)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--ivory-deep)';
                              e.currentTarget.style.color = 'var(--maroon)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                              e.currentTarget.style.color = 'var(--ink)';
                            }}
                          >
                            {sub}
                            <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>→</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* User login / account */}
          <div ref={userRef} style={{ position: 'relative' }}>
            {loggedUser ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="User account"
                  onClick={() => setUserOpen((v) => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '6px',
                    borderRadius: '50%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 14px)',
                        right: 0,
                        minWidth: 200,
                        background: 'var(--ivory)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius)',
                        boxShadow: '0 24px 60px rgba(36,27,21,0.16)',
                        zIndex: 60,
                        padding: '0.5rem',
                      }}
                    >
                      <div style={{ padding: '0.6rem 0.9rem', borderBottom: '1px solid var(--line)', marginBottom: '0.3rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{loggedUser.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.15rem' }}>{loggedUser.email}</div>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserOpen(false)}
                        className="eyebrow"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.7rem 0.9rem',
                          color: 'var(--ink)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.08em',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--ivory-deep)';
                          e.currentTarget.style.color = 'var(--maroon)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = 'var(--ink)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserOpen(false)}
                        className="eyebrow"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.7rem 0.9rem',
                          color: 'var(--ink)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.08em',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--ivory-deep)';
                          e.currentTarget.style.color = 'var(--maroon)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = 'var(--ink)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        Orders
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserOpen(false)}
                        className="eyebrow"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.7rem 0.9rem',
                          color: 'var(--ink)',
                          fontSize: '0.75rem',
                          letterSpacing: '0.08em',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--ivory-deep)';
                          e.currentTarget.style.color = 'var(--maroon)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = 'var(--ink)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                        </svg>
                        My Profile
                      </Link>
                      <div style={{ borderTop: '1px solid var(--line)', marginTop: '0.3rem', paddingTop: '0.3rem' }}>
                        <button
                          onClick={handleLogout}
                          className="eyebrow"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '0.7rem 0.9rem',
                            color: 'var(--ink)',
                            fontSize: '0.75rem',
                            letterSpacing: '0.08em',
                            borderRadius: 'var(--radius-sm)',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--ivory-deep)';
                            e.currentTarget.style.color = 'var(--maroon)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = 'var(--ink)';
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                to="/login"
                aria-label="User account"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '6px',
                  borderRadius: '50%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>

          {/* Liked products */}
          <div ref={likedRef} style={{ position: 'relative' }}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Liked products"
              onClick={() => setLikedOpen((v) => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={likedCount > 0 ? 'var(--maroon)' : 'none'} stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <AnimatePresence>
                {likedCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
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
                  {likedCount}
                </motion.span>
              )}
            </AnimatePresence>
            </motion.button>

            {/* Liked dropdown */}
            <AnimatePresence>
              {likedOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 14px)',
                    right: 0,
                    width: 'min(320px, 90vw)',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    background: 'var(--ivory)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 24px 60px rgba(36,27,21,0.16)',
                    zIndex: 60,
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
                    <span className="eyebrow" style={{ color: 'var(--ink-soft)' }}>
                      Liked Items ({likedCount})
                    </span>
                    <motion.button
                      whileHover={{ opacity: 0.7 }}
                      onClick={() => setLikedOpen(false)}
                      aria-label="Close liked list"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--ink-soft)', padding: 2 }}
                    >
                      ✕
                    </motion.button>
                  </div>

                  {likedItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.6rem', display: 'block' }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>No liked items yet.</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Tap ♥ on any product to save it here.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {likedItems.map((p) => (
                        <motion.div
                          key={p.id}
                          whileHover={{ backgroundColor: 'var(--ivory-deep)' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <Link to={`/product/${p.id}`} onClick={() => setLikedOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                            <img
                              src={p.variants[0].images[0]}
                              alt={p.name}
                              style={{ width: 46, height: 58, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--maroon)', fontFamily: 'var(--font-body)', marginTop: '0.1rem' }}>
                                ₹{p.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            onClick={() => onToggleLike(p.id)}
                            aria-label={`Remove ${p.name} from liked`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', padding: 4, flexShrink: 0 }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--line)', marginTop: '0.35rem', paddingTop: '0.75rem', textAlign: 'center' }}>
                        <Link
                          to="/shop"
                          onClick={() => setLikedOpen(false)}
                          className="eyebrow"
                          style={{ color: 'var(--maroon)', cursor: 'pointer' }}
                        >
                          Continue Shopping →
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" aria-label="Cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
