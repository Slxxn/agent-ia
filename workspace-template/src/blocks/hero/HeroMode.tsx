import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeUp, slideRight, stagger } from '@/lib/motion';

export interface HeroModeProps {
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta: { label: string; href: string };
  featuredImage?: string;
  season?: string;
}

export default function HeroMode({ headline, headlineAccent, sub, cta, featuredImage, season }: HeroModeProps) {
  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Left — editorial text */}
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(2rem,8vw,6rem) clamp(1.5rem,5vw,4rem)', paddingTop: 'calc(clamp(2rem,8vw,6rem) + 80px)' }}
      >
        {season && (
          <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 32 }}>
            {season}
          </motion.p>
        )}

        <motion.h1
          variants={fadeUp}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 24 }}
        >
          {headline}
          {headlineAccent && (
            <><br /><em style={{ fontStyle: 'italic', fontWeight: 800, color: 'var(--primary)' }}>{headlineAccent}</em></>
          )}
        </motion.h1>

        {sub && (
          <motion.p variants={fadeUp} style={{ fontSize: 'clamp(1rem, 1.8vw, 1.1rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
            {sub}
          </motion.p>
        )}

        <motion.div variants={fadeUp}>
          <Link to={cta.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--text)', borderBottom: '1.5px solid var(--text)', paddingBottom: 4, transition: 'opacity 0.2s' }}>
            {cta.label} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </motion.div>

      {/* Right — featured image */}
      <motion.div
        variants={slideRight}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {featuredImage ? (
          <img src={featuredImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)' }} />
        )}
      </motion.div>

      <style>{`@media(max-width:768px){section{grid-template-columns:1fr!important}section>div:last-child{height:50vw!important}}`}</style>
    </section>
  );
}
