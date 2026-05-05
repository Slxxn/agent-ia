import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TimelineProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  events: TimelineEvent[];
}

export default function Timeline({ badge, headline, headlineAccent, sub, events }: TimelineProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', marginBottom: 64 }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>{sub}</motion.p>}
        </motion.div>

        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--bd)', transform: 'translateX(-50%)' }} className="hidden sm:block" />
          {events.map((ev, i) => (
            <motion.div key={i} variants={fadeUp} style={{
              display: 'flex', alignItems: 'flex-start', gap: 24,
              marginBottom: 48, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
            }} className="flex-col sm:flex">
              <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }} className="text-left sm:text-inherit">
                <div style={{ display: 'inline-block', background: 'var(--primary-muted)', border: '1px solid var(--primary-border)', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{ev.year}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{ev.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{ev.description}</p>
              </div>
              <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: '2px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 1 }}>
                {ev.icon || '●'}
              </div>
              <div style={{ flex: 1 }} className="hidden sm:block" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
