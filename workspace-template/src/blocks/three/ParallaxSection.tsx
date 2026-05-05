/**
 * ParallaxSection — Deep parallax scroll section with floating 3D layers.
 * Uses framer-motion scroll tracking (no R3F dep needed).
 */
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface ParallaxSectionProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  backgroundImageUrl?: string;
  layers?: { imageUrl: string; depth: number; }[];
  accentColor?: string;
  items?: { icon: string; title: string; description: string; }[];
}

export default function ParallaxSection({ badge, headline, headlineAccent, sub, backgroundImageUrl, layers, accentColor = '#6366f1', items }: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const y0 = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'var(--bg)' }}
    >
      {/* Background layer */}
      {backgroundImageUrl && (
        <motion.div style={{ position: 'absolute', inset: '-20%', y: y0 }} aria-hidden>
          <img src={backgroundImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
        </motion.div>
      )}

      <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', y: y1 }} aria-hidden>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, background: accentColor, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, background: '#38bdf8', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.06 }} />
      </motion.div>

      <motion.div
        style={{ position: 'relative', zIndex: 1, opacity, width: '100%' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto', marginBottom: items ? 56 : 0 }}>
            {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16 }}>
              {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
            </motion.h2>
            {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
          </motion.div>

          {items && (
            <motion.div variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={VIEWPORT} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', backdropFilter: 'blur(12px)' }}
                >
                  <div style={{ fontSize: 26, marginBottom: 12 }}>{item.icon}</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
