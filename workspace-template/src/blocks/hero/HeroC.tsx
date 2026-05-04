/**
 * HeroC — Full-bleed image/video background hero with overlay.
 * Best for: photography, events, luxury, hospitality.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

export interface HeroCProps {
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string; };
  ctaSecondary?: { label: string; href: string; };
  backgroundImageUrl: string;
  overlayOpacity?: number;
  showScrollIndicator?: boolean;
}

export default function HeroC({ headline, headlineAccent, sub, cta, ctaSecondary, backgroundImageUrl, overlayOpacity = 0.55, showScrollIndicator }: HeroCProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* BG image */}
      <div aria-hidden style={{ position: 'absolute', inset: 0 }}>
        <img
          src={backgroundImageUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOpacity})` }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,15,18,0.9) 0%, transparent 60%)' }} />
      </div>

      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760, margin: '0 auto', padding: '80px 24px 40px' }}
      >
        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4.4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20, textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
          {ctaSecondary && (
            <Link
              to={ctaSecondary.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 15, fontWeight: 500, padding: '13px 28px', borderRadius: 'var(--radius)',
                border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)',
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                transition: 'all 0.18s',
              }}
            >
              {ctaSecondary.label}
            </Link>
          )}
        </motion.div>
      </motion.div>

      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)' }}
        >
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
