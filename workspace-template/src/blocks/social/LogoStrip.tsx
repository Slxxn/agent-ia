import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, VIEWPORT } from '@/lib/motion';

export interface LogoStripProps {
  badge?: string;
  headline?: string;
  logos: { name: string; url?: string }[];
}

export default function LogoStrip({ badge, headline, logos }: LogoStripProps) {
  return (
    <section style={{ padding: '56px 0', background: 'var(--surface)', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(badge || headline) && (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
            style={{ textAlign: 'center', marginBottom: 36 }}>
            {badge && <span className="section-label" style={{ marginBottom: 8, display: 'inline-block' }}>{badge}</span>}
            {headline && <p style={{ fontSize: '0.95rem', color: 'var(--muted)', fontWeight: 500 }}>{headline}</p>}
          </motion.div>
        )}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '32px 48px' }}
        >
          {logos.map((logo, i) => (
            <div key={i} style={{
              padding: '10px 24px',
              background: 'var(--surface2)',
              border: '1px solid var(--bd)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 120, height: 52,
              opacity: 0.7, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
            >
              {logo.url ? (
                <img src={logo.url} alt={logo.name} style={{ maxHeight: 28, maxWidth: 100, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{logo.name}</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
