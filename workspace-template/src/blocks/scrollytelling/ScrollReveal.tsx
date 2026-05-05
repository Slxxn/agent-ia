import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ScrollRevealItem {
  icon?: string;
  title: string;
  description: string;
}

export interface ScrollRevealProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  items: ScrollRevealItem[];
  accentColor?: string;
}

export default function ScrollReveal({ badge, headline, headlineAccent, items, accentColor = 'var(--primary)' }: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineH = useTransform(scrollYProgress, [0.05, 0.9], ['0%', '100%']);

  return (
    <section ref={ref} style={{ padding: '100px 0', background: 'var(--surface)', overflow: 'hidden' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 80 }}>
          {badge && <div style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></div>}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </h2>
        </motion.div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'var(--bd)' }} />
          <motion.div style={{ position: 'absolute', left: 19, top: 0, width: 2, background: accentColor, height: lineH, transformOrigin: 'top' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
            {items.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -32 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: item.icon ? 18 : 14, fontWeight: 800, color: '#fff', zIndex: 1, boxShadow: `0 0 20px ${accentColor}60` }}>
                  {item.icon || (i + 1)}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.75 }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
