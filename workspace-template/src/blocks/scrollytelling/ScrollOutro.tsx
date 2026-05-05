import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ScrollOutroProps {
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  accentColor?: string;
}

export default function ScrollOutro({ headline, headlineAccent, sub, cta, ctaSecondary, accentColor = 'var(--primary)' }: ScrollOutroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={ref} style={{ padding: '120px 0', background: 'var(--bg)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${accentColor}18 0%, transparent 65%)` }} />

      <motion.div style={{ scale, opacity, position: 'relative', zIndex: 1 }}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" >
        <div style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${accentColor}18`, border: `1px solid ${accentColor}40`, borderRadius: 40, padding: '6px 18px', fontSize: 13, fontWeight: 600, color: accentColor, marginBottom: 32 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, animation: 'pulse 2s infinite' }} />
            Prêt à démarrer ?
          </motion.div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1.05, marginBottom: 24 }}>
            {headline}
            {headlineAccent && <><br /><span className="gradient-text">{headlineAccent}</span></>}
          </h2>

          {sub && <p style={{ fontSize: '1.1rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>{sub}</p>}

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={cta.href} className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>{cta.label}</a>
            {ctaSecondary && <a href={ctaSecondary.href} className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 28px' }}>{ctaSecondary.label}</a>}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
