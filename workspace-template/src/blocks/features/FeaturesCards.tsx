/**
 * FeaturesCards — Large card layout with numbered steps or alternating layout.
 * Best for: how-it-works, process steps, detailed features.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, slideLeft, slideRight, stagger, VIEWPORT } from '@/lib/motion';

export interface FeatureCard {
  number?: string;
  icon?: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface FeaturesCardsProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  items: FeatureCard[];
  layout?: 'numbered' | 'alternating';
}

export default function FeaturesCards({ badge, headline, headlineAccent, sub, items, layout = 'numbered' }: FeaturesCardsProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}
        >
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        {layout === 'numbered' ? (
          <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEWPORT} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div key={i} variants={fadeUp} style={{ padding: '32px 28px', background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 800, color: 'var(--bd-bright)', lineHeight: 1, userSelect: 'none' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                {item.icon && <div style={{ fontSize: 28, marginBottom: 16 }}>{item.icon}</div>}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65 }}>{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-16">
            {items.map((item, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  variants={stagger(0.1)}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-20 items-center ${!isEven ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  <motion.div variants={isEven ? slideLeft : slideRight}>
                    {item.icon && <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>}
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 12 }}>
                      Étape {i + 1}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>{item.title}</h3>
                    <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{item.description}</p>
                  </motion.div>
                  <motion.div variants={isEven ? slideRight : slideLeft}>
                    {item.imageUrl ? (
                      <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--bd)', boxShadow: '0 24px 60px -12px rgba(0,0,0,0.5)' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: 320, objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ borderRadius: 'var(--radius-lg)', background: 'var(--surface)', border: '1px solid var(--bd)', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '5rem' }}>{item.icon}</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
