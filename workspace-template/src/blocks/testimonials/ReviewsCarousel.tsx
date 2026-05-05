import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, VIEWPORT } from '@/lib/motion';

export interface Review {
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  rating?: number;
  text: string;
}

export interface ReviewsCarouselProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  reviews: Review[];
}

export default function ReviewsCarousel({ badge, headline, headlineAccent, reviews }: ReviewsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    setDir(n > current ? 1 : -1);
    setCurrent(n);
  };

  const prev = () => go((current - 1 + reviews.length) % reviews.length);
  const next = () => go((current + 1) % reviews.length);

  const r = reviews[current];

  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', marginBottom: 52 }}>
          {badge && <div style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></div>}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)' }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </h2>
        </motion.div>

        <div style={{ position: 'relative', minHeight: 240 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={current}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.35 }}
              style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)', padding: '40px 44px', textAlign: 'center' }}>
              {r.rating && (
                <div style={{ marginBottom: 16, color: '#fbbf24', fontSize: 18, letterSpacing: 2 }}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
              )}
              <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 28 }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                {r.avatarUrl ? (
                  <img src={r.avatarUrl} alt={r.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-border)' }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-muted)', border: '2px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                    {r.name.charAt(0)}
                  </div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{r.name}</div>
                  {(r.role || r.company) && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{[r.role, r.company].filter(Boolean).join(', ')}</div>}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 28 }}>
          <button onClick={prev} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--bd)', color: 'var(--text)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          {reviews.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? 'var(--primary)' : 'var(--bd)', border: 'none', cursor: 'pointer', transition: 'all 0.25s', padding: 0 }} />
          ))}
          <button onClick={next} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--bd)', color: 'var(--text)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
        </div>
      </div>
    </section>
  );
}
