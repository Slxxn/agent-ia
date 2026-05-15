import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

export interface HeroMedicalProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  certifications?: string[];
  partnerLogos?: { name: string; url?: string }[];
}

export default function HeroMedical({ badge, headline, headlineAccent, sub, cta, certifications, partnerLogos }: HeroMedicalProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg)', overflow: 'hidden', paddingTop: 80 }}>
      {/* Subtle background gradient */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, background: 'var(--primary)', borderRadius: '50%', filter: 'blur(160px)', opacity: 0.06 }} />
      </div>

      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 4rem)', textAlign: 'center' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span className="section-label">{badge}</span>
          </motion.div>
        )}

        {certifications && certifications.length > 0 && (
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {certifications.map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, border: '1px solid var(--bd)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.06em' }}>
                <ShieldCheck size={11} style={{ color: 'var(--primary)' }} /> {c}
              </span>
            ))}
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 20 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
        </motion.div>

        {partnerLogos && partnerLogos.length > 0 && (
          <motion.div variants={fadeUp} style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--bd)' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Partenaires & mutuelles</p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {partnerLogos.map((p, i) => (
                <span key={i} style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted2)', opacity: 0.7 }}>{p.name}</span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
