import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Home, TrendingUp } from 'lucide-react';
import { fadeUp, slideRight, stagger } from '@/lib/motion';

export interface HeroImmobilierProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string };
  imageUrl?: string;
  stats?: { value: string; label: string }[];
  location?: string;
}

const DEFAULT_STATS = [
  { value: '350+', label: 'Biens vendus' },
  { value: '98%', label: 'Clients satisfaits' },
  { value: '15 ans', label: "Sur le marché" },
];

export default function HeroImmobilier({ badge, headline, headlineAccent, sub, cta, imageUrl, stats = DEFAULT_STATS, location }: HeroImmobilierProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Left — content */}
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem,7vw,5rem) clamp(1.5rem,5vw,4rem)', paddingTop: 'calc(clamp(2rem,7vw,5rem) + 80px)', zIndex: 1 }}
      >
        {location && (
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <MapPin size={13} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: 500 }}>{location}</span>
          </motion.div>
        )}

        {badge && (
          <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
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

        <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}>
          {sub}
        </motion.p>

        <motion.div variants={fadeUp} style={{ marginBottom: 52 }}>
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 30px' }}>
            <Home size={15} /> {cta.label} <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 32, paddingTop: 28, borderTop: '1px solid var(--bd)' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right — image with floating card */}
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

        {/* Floating price card */}
        <div style={{ position: 'absolute', bottom: 40, right: 32, background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 12, padding: '16px 20px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <TrendingUp size={12} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>Marché actif</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Estimation gratuite</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>En 24h</div>
        </div>
      </motion.div>

      <style>{`@media(max-width:768px){section{grid-template-columns:1fr!important}section>div:last-child{height:55vw!important}}`}</style>
    </section>
  );
}
