import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Testimonial as ApiTestimonial } from '../lib/api';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  category: string;
  rating: number;
  quote: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Entrepreneur',
    category: 'Kanjivaram Silk',
    rating: 5,
    quote: 'The Kanjivaram silk is everything I hoped for — the zari work is breathtaking. The feel, the drape, everything feels royal.',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Ananya Iyer',
    role: 'Bride',
    category: 'Bridal Banarasi',
    rating: 5,
    quote: 'My bridal Banarasi was the star of the wedding. So many compliments! Thank you, Village Allure for making my day special.',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Deepa Nair',
    role: 'College Professor',
    category: 'Chanderi Cotton',
    rating: 5,
    quote: 'Wore the Chanderi to work — got more compliments than my presentation. Light, elegant and so comfortable.',
    image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '4',
    name: 'Meera Joshi',
    role: 'Artist',
    category: 'Jamdani Weave',
    rating: 5,
    quote: 'The Jamdani feels like wearing a piece of art. Truly one of a kind. The detailing is so fine and authentic.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '5',
    name: 'Lakshmi Rao',
    role: 'Homemaker',
    category: 'Tant Cotton',
    rating: 4,
    quote: 'Ordered the Tant cotton — light, crisp, and perfect for summer weddings. My go-to for every festive occasion now.',
    image: 'https://images.pexels.com/photos/11815239/pexels-photo-11815239.jpeg?w=400&h=400&fit=crop&crop=face',
  },
  {
    id: '6',
    name: 'Kavitha Menon',
    role: 'Fashion Stylist',
    category: 'Temple Jewellery',
    rating: 5,
    quote: 'The temple kemp necklace completes every silk saree look beautifully. Craftsmanship is just outstanding!',
    image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?w=400&h=400&fit=crop&crop=face',
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, color: 'var(--gold)' }} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: '0.95rem', opacity: i < rating ? 1 : 0.25, lineHeight: 1 }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [list, setList] = useState<Testimonial[]>(testimonials);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    api.testimonials.getActive().then((data) => {
      if (data.length > 0) {
        setList(data.map((t: ApiTestimonial) => ({ id: t.id, name: t.name, role: t.role, category: t.category, rating: t.rating, quote: t.quote, image: t.image })));
      }
    }).catch(() => {});
  }, []);
  const next = useCallback(() => setIndex((p) => (p + 1) % (list.length || 1)), [list.length]);
  const prev = useCallback(() => setIndex((p) => (p - 1 + (list.length || 1)) % (list.length || 1)), [list.length]);
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(next, 3000);
    return () => window.clearInterval(t);
  }, [next, paused]);
  const t = list[index] || list[0];
  if (!t) return null;
  return (
    <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ background: 'var(--ivory-deep)', padding: '4rem 0 3.5rem', overflow: 'hidden' }}>
      <style>{`
        .t-wrap{ max-width:680px; margin:0 auto; padding:0 0.5rem; }
        .t-card-outer{ background:var(--ivory); border:1px solid var(--line); border-radius:var(--radius); box-shadow:0 20px 50px rgba(36,27,21,0.14), 0 8px 20px rgba(36,27,21,0.08), 0 2px 8px rgba(36,27,21,0.06); padding:1.8rem 1.9rem 1.2rem; min-height:300px; display:flex; flex-direction:column; overflow:hidden; position:relative; }
        .t-dot{ height:8px; border-radius:999px; border:none; cursor:pointer; transition:all 0.3s cubic-bezier(0.22,1,0.36,1); padding:0; }
        .t-dot.active{ width:22px; background:var(--gold); box-shadow:0 2px 8px rgba(201,169,110,0.45); transform:translateY(-1px); }
        .t-dot.idle{ width:8px; background:rgba(201,169,110,0.3); }
        .t-card-inner{ flex:1; display:flex; flex-direction:column; justify-content:space-between; min-height:220px; }
        .t-quote{ font-family:var(--font-display); font-style:italic; font-size:1.08rem; line-height:1.7; color:var(--ink); margin-top:0.9rem; }
        .t-footer{ display:flex; align-items:center; justify-content:flex-end; gap:1rem; margin-top:1.1rem; }
        .t-name-block{ flex:0 0 auto; min-width:0; text-align:right; padding-bottom:0.15rem; }
        .t-img-wrap{ flex-shrink:0; width:118px; height:118px; position:relative; margin-right:4px; margin-bottom:2px; }
        .t-img-wrap img{ width:100%; height:100%; object-fit:cover; border-radius:50%; border:3px solid var(--ivory); box-shadow:0 8px 24px rgba(36,27,21,0.16), 0 0 0 1px var(--line); display:block; }
        .t-img-wrap::after{ content:''; position:absolute; inset:-6px; border-radius:50%; border:1px solid rgba(201,169,110,0.18); pointer-events:none; }
        @media(max-width:860px){
          .t-card-outer{ min-height:285px; padding:1.6rem 1.5rem 1.15rem; }
          .t-card-inner{ min-height:210px; }
          .t-img-wrap{ width:108px; height:108px; }
        }
        @media(max-width:640px){
          .t-card-outer{ min-height:320px; padding:1.4rem 1.25rem 1.1rem; }
          .t-card-inner{ min-height:250px; }
          .t-quote{ text-align:center; font-size:1rem; }
          .t-footer{ flex-direction:column; align-items:center; text-align:center; gap:0.9rem; }
          .t-name-block{ padding-bottom:0; order:1; text-align:center; }
          .t-img-wrap{ order:2; width:104px; height:104px; margin-right:0; }
          .t-stars{ justify-content:center; }
        }
      `}</style>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="eyebrow">Customer Love</span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.35rem', fontStyle: 'italic' }}>What Our Clients Say</h2>
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} style={{ width: 60, height: 2, background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))', margin: '0.7rem auto 0', transformOrigin: 'center' }} />
        </motion.div>
        <div className="t-wrap">
          <div className="t-card-outer">
            <AnimatePresence mode="wait">
              <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="t-card-inner">
                <div>
                  <div className="t-stars" style={{ display: 'flex' }}>
                    <Stars rating={t.rating} />
                  </div>
                  <p className="t-quote">“{t.quote}”</p>
                </div>
                <div className="t-footer">
                  <div className="t-name-block">
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--maroon-deep)', lineHeight: 1.2 }}>{t.name}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: 4, letterSpacing: '0.02em' }}>
                      {t.role} <span style={{ color: 'var(--gold)', margin: '0 0.35rem' }}>•</span> {t.category}
                    </div>
                  </div>
                  <div className="t-img-wrap">
                    <img src={t.image} alt={t.name} loading="lazy" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.15rem' }}>
            <button onClick={prev} aria-label="Previous testimonial" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--ivory)', color: 'var(--maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 2px 10px rgba(36,27,21,0.06)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--maroon)'; e.currentTarget.style.color = 'var(--ivory)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ivory)'; e.currentTarget.style.color = 'var(--maroon)'; }}>‹</button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {list.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} aria-label={`Go to testimonial ${i + 1}`} className={`t-dot ${i === index ? 'active' : 'idle'}`} />
              ))}
            </div>
            <button onClick={next} aria-label="Next testimonial" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--ivory)', color: 'var(--maroon)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 2px 10px rgba(36,27,21,0.06)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--maroon)'; e.currentTarget.style.color = 'var(--ivory)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ivory)'; e.currentTarget.style.color = 'var(--maroon)'; }}>›</button>
          </div>
        </div>
      </div>
    </section>
  );
}
