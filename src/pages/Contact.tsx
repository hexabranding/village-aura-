import { useState } from 'react';
import { motion } from 'framer-motion';
import ZariDivider from '../components/ZariDivider';

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
  outline: 'none',
};

const infoCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  padding: '1.25rem',
  background: 'var(--ivory-deep)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--line)',
};

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: '4rem 0 5rem' }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginTop: '0.5rem', fontStyle: 'italic' }}
          >
            Contact Us
          </motion.h1>
          <ZariDivider />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', marginTop: '0.2rem', maxWidth: 480, margin: '0.2rem auto 0' }}
          >
            Have a question about a weave, an order, or just want to say hello? We'd love to hear from you.
          </motion.p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            alignItems: 'start',
          }}
        >
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: 'var(--ivory)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 24px 60px rgba(36,27,21,0.08)',
              padding: '2.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontStyle: 'italic', marginBottom: '1.75rem' }}>Send a Message</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="eyebrow" htmlFor="contact-name" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="eyebrow" htmlFor="contact-email" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="eyebrow" htmlFor="contact-subject" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label className="eyebrow" htmlFor="contact-message" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-solid"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '0.85rem' }}
              >
                {sent ? 'Message Sent ✓' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={infoCardStyle}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ivory)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--gold)', fontSize: '0.62rem', marginBottom: '0.3rem' }}>Visit Us</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6 }}>
                  123 Weaver's Street<br />
                  Chandni Chowk, Delhi 110006<br />
                  India
                </div>
              </div>
            </div>

            <div style={infoCardStyle}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ivory)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--gold)', fontSize: '0.62rem', marginBottom: '0.3rem' }}>Call Us</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6 }}>
                  +91 98765 43210<br />
                  Mon – Sat, 10 AM – 7 PM IST
                </div>
              </div>
            </div>

            <div style={infoCardStyle}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--maroon)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ivory)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--gold)', fontSize: '0.62rem', marginBottom: '0.3rem' }}>Email Us</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6 }}>
                  hello@resham.in<br />
                  support@resham.in
                </div>
              </div>
            </div>

            {/* Social links */}
            <div
              style={{
                marginTop: '0.5rem',
                padding: '1.5rem',
                background: 'var(--maroon-deep)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
              }}
            >
              <div className="eyebrow" style={{ color: 'var(--gold-soft)', fontSize: '0.62rem', marginBottom: '0.75rem' }}>
                Follow Our Journey
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {[
                  { label: 'Instagram', path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z' },
                  { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                  { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' },
                ].map((s) => (
                  <motion.a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ivory)',
                      textDecoration: 'none',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.path} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
