/**
 * TestimonialsGrid — Masonry-style testimonial cards.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  rating?: number;
}

export interface TestimonialsGridProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  items: Testimonial[];
}

const Stars = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= n ? '#F59E0B' : 'var(--bd-bright)'}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
);

export default function TestimonialsGrid({ badge, headline, headlineAccent, items }: TestimonialsGridProps) {
  const cols = [
    items.filter((_, i) => i % 3 === 0),
    items.filter((_, i) => i % 3 === 1),
    items.filter((_, i) => i % 3 === 2),
  ];

  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)' }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
        </motion.div>

        {/* Desktop masonry */}
        <div className="hidden lg:grid grid-cols-3 gap-6 items-start">
          {cols.map((col, ci) => (
            <motion.div key={ci} variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={VIEWPORT} className="flex flex-col gap-6">
              {col.map((t, ti) => <TestimonialCard key={ti} t={t} />)}
            </motion.div>
          ))}
        </div>

        {/* Mobile single col */}
        <motion.div variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={VIEWPORT} className="lg:hidden flex flex-col gap-5">
          {items.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{ padding: '24px', background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)' }}
    >
      {t.rating && <Stars n={t.rating} />}
      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, margin: '12px 0 16px', fontStyle: 'italic' }}>"{t.quote}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt={t.author} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bd-bright)' }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-muted)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
            {t.author[0]}
          </div>
        )}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.author}</p>
          {(t.role || t.company) && (
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>{[t.role, t.company].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
