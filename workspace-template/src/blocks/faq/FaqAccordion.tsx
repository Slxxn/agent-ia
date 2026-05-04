/**
 * FaqAccordion — Expandable FAQ with smooth animation.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface FaqItem { question: string; answer: string; }

export interface FaqAccordionProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  items: FaqItem[];
}

export default function FaqAccordion({ badge, headline, headlineAccent, items }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', marginBottom: 48 }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)' }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
        </motion.div>

        <motion.div variants={stagger(0.06)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeUp} style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{item.question}</span>
                <span style={{ flexShrink: 0, color: open === i ? 'var(--primary)' : 'var(--muted)', transition: 'color 0.2s' }}>
                  {open === i ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
