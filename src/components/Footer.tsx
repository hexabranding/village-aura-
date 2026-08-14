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
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>© {new Date().getFullYear()} Resham. All rights reserved.</span>
        <span>Made with care, in India.</span>
      </div>
    </footer>
  );
}
