import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ScrollHeroProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta?: { label: string; href: string };
  backgroundImageUrl?: string;
  overlayColor?: string;
}

export default function ScrollHero({ badge, headline, headlineAccent, sub, cta, backgroundImageUrl, overlayColor = 'var(--bg)' }: ScrollHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section ref={ref} style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {backgroundImageUrl ? (
        <motion.div style={{ position: 'absolute', inset: 0, y, scale }}>
          <img src={backgroundImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
        </motion.div>
      ) : (
        <motion.div style={{ position: 'absolute', inset: 0, y }}>
          <div style={{ width: '100%', height: '100%', background: `radial-gradient(ellipse at 60% 40%, var(--primary-muted) 0%, var(--bg) 70%)` }} />
        </motion.div>
      )}

      <motion.div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800, padding: '0 24px', opacity, y: useTransform(scrollYProgress, [0, 0.7], ['0px', '-40px']) }}>
        {badge && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
            style={{ marginBottom: 24 }}><span className="section-label">{badge}</span>
          </motion.div>
        )}
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1.05, marginBottom: 24 }}>
          {headline}{headlineAccent && <><br /><span className="gradient-text">{headlineAccent}</span></>}
        </motion.h1>
        {sub && (
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 40 }}>{sub}
          </motion.p>
        )}
        {cta && (
          <motion.a href={cta.href} className="btn-primary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
            style={{ fontSize: '1rem', padding: '14px 32px' }}>
            {cta.label}
          </motion.a>
        )}
      </motion.div>

      <motion.div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ width: 28, height: 48, border: '2px solid var(--bd)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 6 }}>
          <motion.div animate={{ y: [0, 14, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            style={{ width: 4, height: 8, borderRadius: 2, background: 'var(--accent)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
