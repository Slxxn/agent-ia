import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users, Zap } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

export interface HeroSportProps {
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  backgroundImage?: string;
  stats?: { value: string; label: string }[];
}

const DEFAULT_STATS = [
  { value: '500+', label: 'Membres actifs' },
  { value: '12', label: 'Disciplines' },
  { value: '20 ans', label: "D'expérience" },
];

export default function HeroSport({ headline, headlineAccent, sub, cta, ctaSecondary, backgroundImage, stats = DEFAULT_STATS }: HeroSportProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {backgroundImage ? (
          <img src={backgroundImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' }} />
      </div>

      {/* Diagonal accent */}
      <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, width: 4, height: '100%', background: 'var(--primary)', transform: 'skewX(-8deg)', transformOrigin: 'top right' }} />

      {/* Content */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1, padding: 'clamp(3rem,8vw,6rem) clamp(1.5rem,5vw,4rem)', paddingTop: '120px' }}
      >
        <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 4, background: 'var(--primary)', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Zap size={10} /> Performance & Passion
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', color: '#fff', marginBottom: 20, textTransform: 'uppercase' }}
        >
          {headline}
          {headlineAccent && (
            <><br /><span style={{ color: 'var(--primary)' }}>{headlineAccent}</span></>
          )}
        </motion.h1>

        {sub && (
          <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 500, marginBottom: 36 }}>
            {sub}
          </motion.p>
        )}

        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
          {ctaSecondary && (
            <Link to={ctaSecondary.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, padding: '13px 24px', transition: 'border-color 0.2s' }}>
              {ctaSecondary.label}
            </Link>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: 1, paddingRight: 24, borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none', marginRight: i < stats.length - 1 ? 24 : 0 }}>
              <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
