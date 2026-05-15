import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Users, HandHeart } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

export interface HeroAssociationProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  impact?: { value: string; label: string }[];
}

const DEFAULT_IMPACT = [
  { value: '1 200', label: 'Bénéficiaires' },
  { value: '85', label: 'Bénévoles' },
  { value: '8 ans', label: "D'engagement" },
];

export default function HeroAssociation({ badge, headline, headlineAccent, sub, cta, ctaSecondary, impact = DEFAULT_IMPACT }: HeroAssociationProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden', paddingTop: 80 }}>
      {/* Warm glow */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'var(--primary)', borderRadius: '50%', filter: 'blur(200px)', opacity: 0.07 }} />
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,4rem)', textAlign: 'center' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'var(--primary-muted)', border: '1px solid var(--primary-border)', fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.06em' }}>
              <Heart size={12} /> {badge}
            </span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            <HandHeart size={16} /> {cta.label}
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--text2)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '13px 24px' }}>
              {ctaSecondary.label} <ArrowRight size={14} />
            </Link>
          )}
        </motion.div>

        {/* Impact counters */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: `repeat(${impact.length}, 1fr)`, gap: 1, background: 'var(--bd)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--bd)' }}>
          {impact.map((item, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.04em' }}>{item.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
