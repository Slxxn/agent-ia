import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Clock, Star } from 'lucide-react';
import { fadeUp, slideLeft, slideRight, stagger } from '@/lib/motion';

export interface HeroArtisanProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  imageUrl?: string;
  certifications?: string[];
  guarantees?: { icon?: string; label: string }[];
}

const DEFAULT_GUARANTEES = [
  { label: 'Devis gratuit sous 24h' },
  { label: 'Note clients 4.9/5' },
  { label: 'Garantie décennale' },
];

export default function HeroArtisan({ badge, headline, headlineAccent, sub, cta, imageUrl, certifications, guarantees = DEFAULT_GUARANTEES }: HeroArtisanProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Left — content */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem,7vw,5rem) clamp(1.5rem,5vw,4rem)', paddingTop: 'calc(clamp(2rem,7vw,5rem) + 80px)', zIndex: 1 }}
      >
        {certifications && certifications.length > 0 && (
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {certifications.slice(0, 2).map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--bd-bright)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.06em' }}>
                <ShieldCheck size={12} style={{ color: 'var(--primary)' }} /> {c}
              </span>
            ))}
          </motion.div>
        )}

        {badge && !certifications && (
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span className="section-label">{badge}</span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 440, marginBottom: 36 }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ marginBottom: 40 }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {guarantees.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-muted)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={11} style={{ color: 'var(--primary)' }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{g.label}</span>
            </div>
          ))}
        </motion.div>
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
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, transparent 15%)' }} />
      </motion.div>

      <style>{`@media(max-width:768px){section{grid-template-columns:1fr!important}section>div:last-child{display:none!important}}`}</style>
    </section>
  );
}
