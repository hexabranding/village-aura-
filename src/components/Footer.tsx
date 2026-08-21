import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ZariDivider from './ZariDivider';
import logo from '../assets/images/logo.png';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function Footer() {
  const loggedUser = useMemo(() => {
    const saved = localStorage.getItem('reshamUser');
    return saved ? JSON.parse(saved) : null;
  }, []);

  const supportLinks = [
    { name: 'Size & Drape Guide', path: '/contact' },
    { name: 'Shipping & Returns', path: '/contact' },
    { name: 'Fabric Care', path: '/contact' },
    ...(!loggedUser ? [{ name: 'Track Order', path: '/track-order' }] : []),
    { name: 'Contact Us', path: '/contact' },
  ];
  return (
    <footer style={{ background: 'var(--maroon-deep)', color: 'var(--ivory-deep)', marginTop: 'clamp(3rem, 6vw, 6rem)' }}>
      <div className="container" style={{ paddingTop: '3.5rem' }}>
        <ZariDivider tone="ivory" />
      </div>
      <motion.div
        className="container footer-grid"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
          gap: '2.5rem',
          padding: '2.5rem 0 3rem',
        }}
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src={logo}
              alt="Village Allure"
              className="footer-logo"
              style={{ height: 'clamp(60px, 12vw, 140px)', width: 'auto' }}
            />
          </motion.div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--rose-dust)', maxWidth: 280, marginTop: '0.75rem' }}>
            Handwoven sarees from India's weaving houses — Kanchipuram, Banaras, Chanderi and Bengal —
            brought to your door with the story of the loom intact.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '1rem' }}>Shop</div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            {[
              { name: 'Sarees', path: '/shop?category=Sarees' },
              { name: 'Jewellery', path: '/shop?category=Jewellery' },
              { name: 'Bags', path: '/shop?category=Bags' },
              { name: 'Unstitched Suit Sets', path: '/shop?category=Unstitched%20Suit%20Sets' },
            ].map((item) => (
              <motion.li
                key={item.name}
                whileHover={{ x: 6, color: 'var(--gold-soft)' }}
                transition={{ duration: 0.2 }}
              >
                <Link to={item.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '1rem' }}>Support</div>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            {supportLinks.map((item) => (
              <motion.li
                key={item.name}
                whileHover={{ x: 6, color: 'var(--gold-soft)' }}
                transition={{ duration: 0.2 }}
              >
                <Link to={item.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: '1rem' }}>Stay in the loom</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--rose-dust)', marginBottom: '0.9rem' }}>
            New weaves and restocks, once or twice a month.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: 'flex', borderBottom: '1px solid var(--gold-soft)', paddingBottom: '0.4rem' }}
          >
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--ivory)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                flex: 1,
                outline: 'none',
              }}
            />
            <motion.button
              type="submit"
              className="eyebrow"
              whileHover={{ scale: 1.1, color: 'var(--ivory)' }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'none', border: 'none', color: 'var(--gold-soft)', cursor: 'pointer' }}
            >
              Join
            </motion.button>
          </form>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{ color: 'var(--rose-dust)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rose-dust)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              style={{ color: 'var(--rose-dust)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rose-dust)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              style={{ color: 'var(--rose-dust)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--rose-dust)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </motion.div>
      </motion.div>
      <div
        className="container"
        style={{
          borderTop: '1px solid rgba(247,241,230,0.12)',
          padding: '1.25rem 0',
          fontSize: '0.75rem',
          color: 'var(--rose-dust)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <span>© {new Date().getFullYear()} Village Aura. All rights reserved.</span>
        <span>Made with care, in India.</span>
      </div>
    </footer>
  );
}
