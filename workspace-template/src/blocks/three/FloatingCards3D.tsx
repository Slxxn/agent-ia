import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface Card3D {
  icon: string;
  title: string;
  description: string;
  accentColor?: string;
}

export interface FloatingCards3DProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cards: Card3D[];
}

function Card({ card, index }: { card: Card3D; index: number }) {
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    setRot({ x: cy * -16, y: cx * 16 });
  };

  const accent = card.accentColor || 'var(--primary)';

  return (
    <motion.div
      variants={fadeUp}
      onMouseMove={onMove}
      onMouseLeave={() => setRot({ x: 0, y: 0 })}
      animate={{ rotateX: rot.x, rotateY: rot.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--bd)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 28px',
        transformStyle: 'preserve-3d',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ borderColor: accent } as any}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(20px)' }} />
      <div style={{ fontSize: 40, marginBottom: 16, transform: 'translateZ(20px)' }}>{card.icon}</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10, transform: 'translateZ(10px)' }}>{card.title}</h3>
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, transform: 'translateZ(5px)' }}>{card.description}</p>
    </motion.div>
  );
}

export default function FloatingCards3D({ badge, headline, headlineAccent, sub, cards }: FloatingCards3DProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)', perspective: 1200 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 64px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: 800 }}>
          {cards.map((card, i) => <Card key={i} card={card} index={i} />)}
        </motion.div>
      </div>
    </section>
  );
}
