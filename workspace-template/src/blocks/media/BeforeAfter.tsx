import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, VIEWPORT } from '@/lib/motion';

export interface BeforeAfterProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfter({ badge, headline, headlineAccent, sub, beforeImage, afterImage, beforeLabel = 'Avant', afterLabel = 'Après' }: BeforeAfterProps) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
          {badge && <div style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></div>}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 14 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </h2>
          {sub && <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</p>}
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
          ref={containerRef}
          style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'ew-resize', border: '1px solid var(--bd)', aspectRatio: '16/9', userSelect: 'none' }}
          onMouseMove={e => onMove(e.clientX)}
          onTouchMove={e => onMove(e.touches[0].clientX)}>
          <img src={beforeImage} alt={beforeLabel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img src={afterImage} alt={afterLabel} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, transform: 'translateX(-50%)', width: 3, background: 'var(--primary)', zIndex: 2 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 0 16px rgba(0,0,0,0.4)' }}>⇔</div>
          </div>
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>{beforeLabel}</div>
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>{afterLabel}</div>
        </motion.div>
      </div>
    </section>
  );
}
