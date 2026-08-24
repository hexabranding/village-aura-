import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { Ad } from '../lib/api';

/**
 * Fixed advertisement banners — rendered at the top of the home page,
 * right after the hero. Shows active ads with type "fixed".
 * Ads positioned as "sidebar" are reserved and not shown on the home page.
 */
export default function FixedAdBanner() {
  const [fixedAds, setFixedAds] = useState<Ad[]>([]);

  useEffect(() => {
    api.ads.getActive().then((ads) => {
      const fixed = ads
        .filter((ad) => ad.type === 'fixed' && ad.position !== 'sidebar' && ad.image)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setFixedAds(fixed);
    }).catch(() => {});
  }, []);

  if (fixedAds.length === 0) return null;

  return (
    <section className="container" style={{ padding: '2.5rem 1rem 0' }}>
      {fixedAds.map((ad, i) => (
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.12 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 'var(--radius)',
            marginBottom: i < fixedAds.length - 1 ? '1.5rem' : 0,
            minHeight: 220,
            display: 'block',
            boxShadow: '0 20px 50px rgba(36,27,21,0.15)',
          }}
        >
          <Link to={ad.link || '/shop'} style={{ display: 'block' }}>
            <img
              src={ad.image}
              alt={ad.title}
              style={{ width: '100%', minHeight: 220, maxHeight: 420, objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(36,27,21,0.75) 0%, rgba(36,27,21,0.35) 55%, transparent 100%)',
              }}
            />
            {(ad as any).offer && (
              <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', zIndex: 2, background: 'var(--gold)', color: 'var(--ink)', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 4px 18px rgba(0,0,0,0.25)' }}>
                {(ad as any).offer}
              </div>
            )}
            {(ad.title || ad.description) && (
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 'clamp(1.5rem, 5vw, 3.5rem)', right: '1.5rem', maxWidth: 480 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#fff', lineHeight: 1.2 }}>
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--rose-dust)', marginTop: '0.6rem', lineHeight: 1.7 }}>
                      {ad.description}
                    </p>
                  )}
                  {ad.link && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '1.1rem',
                        padding: '0.7rem 1.6rem',
                        background: 'var(--gold)',
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.72rem',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      Shop Now →
                    </span>
                  )}
                </div>
            )}
          </Link>
        </motion.div>
      ))}
    </section>
  );
}
