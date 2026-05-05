import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface Stat {
  value: string;
  label: string;
  description?: string;
}

export interface StatsRowProps {
  badge?: string;
  headline?: string;
  stats: Stat[];
}

export default function StatsRow({ badge, headline, stats }: StatsRowProps) {
  return (
    <section style={{ padding: '72px 0', background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(badge || headline) && (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
            style={{ textAlign: 'center', marginBottom: 52 }}>
            {badge && <span className="section-label" style={{ marginBottom: 12, display: 'inline-block' }}>{badge}</span>}
            {headline && (
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em' }}>{headline}</h2>
            )}
          </motion.div>
        )}
        <motion.div
          variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 1, background: 'var(--bd)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
          className="grid-cols-2 sm:grid-cols-2"
        >
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} style={{
              padding: '40px 32px',
              background: 'var(--surface)',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
              {s.description && <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.description}</div>}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
