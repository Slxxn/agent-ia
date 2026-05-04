/**
 * HeroA — Centered hero with gradient orbs, badge, headline, sub, dual CTA.
 * Best for: agencies, SaaS, services.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface HeroAProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string; };
  ctaSecondary?: { label: string; href: string; };
  showScrollIndicator?: boolean;
  stats?: { value: string; label: string; }[];
}

export default function HeroA({ badge, headline, headlineAccent, sub, cta, ctaSecondary, showScrollIndicator, stats }: HeroAProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)', paddingTop: 80 }}>
      {/* Background orbs */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'var(--primary)', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.12 }} />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 500, height: 500, background: 'var(--accent)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.08 }} />
        <div style={{ position: 'absolute', bottom: 0, left: '-5%', width: 400, height: 400, background: 'var(--accent2)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.06 }} />
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 780, margin: '0 auto', padding: '0 24px' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
            <span className="section-label">{badge}</span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 24 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}
        >
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
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
          <motion.div
            variants={fadeUp}
            style={{ marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}
          >
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--muted2)' }}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
