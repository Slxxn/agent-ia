/**
 * FeaturesGrid — 3-column icon + title + description grid.
 * Best for: services overview, feature lists, why-us sections.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesGridProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export default function FeaturesGrid({ badge, headline, headlineAccent, sub, features, columns = 3 }: FeaturesGridProps) {
  const colClass = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns];

  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}
        >
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className={`grid grid-cols-1 ${colClass} gap-6`}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                padding: '28px 24px',
                background: 'var(--surface2)',
                border: '1px solid var(--bd)',
                borderRadius: 'var(--radius)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              whileHover={{ y: -4, borderColor: 'var(--primary-border)' } as any}
            >
              <div style={{
                width: 44, height: 44,
                background: 'var(--primary-muted)',
                border: '1px solid var(--primary-border)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
