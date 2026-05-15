import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Star } from 'lucide-react';
import { fadeUp, slideLeft, slideRight, stagger } from '@/lib/motion';

export interface HeroCoachProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  photoUrl?: string;
  benefits?: string[];
  socialProof?: { count: string; label: string };
}

const DEFAULT_BENEFITS = [
  'Résultats concrets en 90 jours',
  'Méthode éprouvée et personnalisée',
  'Accompagnement individuel illimité',
];

export default function HeroCoach({ badge, headline, headlineAccent, sub, cta, photoUrl, benefits = DEFAULT_BENEFITS, socialProof }: HeroCoachProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Left — photo */}
      <motion.div
        variants={slideLeft}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, var(--bg) 0%, transparent 20%)' }} />
      </motion.div>

      {/* Right — content */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem,7vw,5rem) clamp(1.5rem,5vw,4rem)', paddingTop: 'calc(clamp(2rem,7vw,5rem) + 80px)' }}
      >
        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
            <span className="section-label">{badge}</span>
          </motion.div>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 440, marginBottom: 28 }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-muted)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} style={{ color: 'var(--primary)' }} />
              </div>
              <span style={{ fontSize: 14, color: 'var(--text2)' }}>{b}</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px', alignSelf: 'flex-start' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>

          {socialProof && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="var(--primary)" style={{ color: 'var(--primary)' }} />)}
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}><strong style={{ color: 'var(--text)' }}>{socialProof.count}</strong> {socialProof.label}</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      <style>{`@media(max-width:768px){section{grid-template-columns:1fr!important}section>div:first-child{display:none!important}}`}</style>
    </section>
  );
}
