import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { fadeUp, slideLeft, slideRight, stagger, VIEWPORT } from '@/lib/motion';

export interface HeroBeauteProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  imageUrl?: string;
  stats?: { value: string; label: string }[];
}

export default function HeroBeaute({ badge, headline, headlineAccent, sub, cta, ctaSecondary, imageUrl, stats }: HeroBeauteProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Left — content */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem,8vw,6rem) clamp(1.5rem,5vw,4rem)', paddingTop: 'calc(clamp(2rem,8vw,6rem) + 80px)' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span className="section-label">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {badge}
            </span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.href} className="btn-ghost" style={{ fontSize: 15, padding: '12px 26px' }}>
              {ctaSecondary.label}
            </Link>
          )}
        </motion.div>

        {stats && stats.length > 0 && (
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 36, paddingTop: 32, borderTop: '1px solid var(--bd)', flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Right — image */}
      <motion.div
        variants={slideRight}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, transparent 20%)' }} />
      </motion.div>

      {/* Mobile layout override */}
      <style>{`
        @media (max-width: 768px) {
          section { grid-template-columns: 1fr !important; }
          section > div:last-child { display: none !important; }
        }
      `}</style>
    </section>
  );
}
