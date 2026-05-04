/**
 * CtaBanner — Full-width call-to-action section.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface CtaBannerProps {
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta: { label: string; href: string; };
  ctaSecondary?: { label: string; href: string; };
  variant?: 'gradient' | 'bordered' | 'dark';
}

export default function CtaBanner({ headline, headlineAccent, sub, cta, ctaSecondary, variant = 'gradient' }: CtaBannerProps) {
  const bgStyle = {
    gradient: { background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)' },
    bordered: { background: 'var(--surface)', border: '1px solid var(--primary-border)', boxShadow: '0 0 80px -20px var(--primary-glow)' },
    dark: { background: 'var(--surface2)', border: '1px solid var(--bd)' },
  }[variant];

  const textColor = variant === 'gradient' ? '#fff' : 'var(--text)';
  const subColor = variant === 'gradient' ? 'rgba(255,255,255,0.75)' : 'var(--muted)';

  return (
    <section style={{ padding: '64px 0', background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          style={{ padding: '56px 40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', position: 'relative', overflow: 'hidden', ...bgStyle }}
        >
          {variant === 'gradient' && (
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
          )}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: textColor, marginBottom: 14, position: 'relative' }}>
            {headline}{headlineAccent && <> <span style={{ opacity: variant === 'gradient' ? 0.85 : 1 }} className={variant !== 'gradient' ? 'gradient-text' : ''}>{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: subColor, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px', position: 'relative' }}>{sub}</motion.p>}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'relative' }}>
            <Link
              to={cta.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px',
                background: variant === 'gradient' ? '#fff' : 'var(--primary)',
                color: variant === 'gradient' ? 'var(--primary)' : '#fff',
                fontWeight: 700, fontSize: 14, borderRadius: 'var(--radius)', border: 'none',
                boxShadow: variant === 'gradient' ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px var(--primary-glow)',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
            >
              {cta.label} <ArrowRight size={15} />
            </Link>
            {ctaSecondary && (
              <Link
                to={ctaSecondary.href}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px',
                  background: 'transparent', color: textColor, fontWeight: 500, fontSize: 14,
                  borderRadius: 'var(--radius)', border: `1px solid ${variant === 'gradient' ? 'rgba(255,255,255,0.35)' : 'var(--bd-bright)'}`,
                  transition: 'all 0.18s',
                }}
              >
                {ctaSecondary.label}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
