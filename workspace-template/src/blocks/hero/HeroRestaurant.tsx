import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface HeroRestaurantProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  backgroundImageUrl?: string;
}

export default function HeroRestaurant({ badge, headline, headlineAccent, sub, cta, ctaSecondary, backgroundImageUrl }: HeroRestaurantProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      {/* Background */}
      {backgroundImageUrl ? (
        <img src={backgroundImageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a0e0a 0%, #0d0806 100%)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(2rem,6vw,5rem)', paddingTop: 120, maxWidth: 900 }}>
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 32, height: 1, background: 'var(--primary)' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--primary)' }}>{badge}</span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20 }}
        >
          {headline}
          {headlineAccent && (
            <> <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{headlineAccent}</em></>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 520, marginBottom: 40 }}
        >
          {sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 500, transition: 'all 0.2s' }}>
              {ctaSecondary.label}
            </Link>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ position: 'absolute', bottom: 40, right: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}
      >
        <motion.div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.3)' }} animate={{ scaleY: [0, 1, 0], originY: 0 }} transition={{ repeat: Infinity, duration: 1.6 }} />
        <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', writingMode: 'vertical-rl' }}>Scroll</span>
      </motion.div>
    </section>
  );
}
