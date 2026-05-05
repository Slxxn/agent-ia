import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface ScrollChapterProps {
  chapterNumber?: string;
  headline: string;
  headlineAccent?: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  reverse?: boolean;
  accentColor?: string;
}

export default function ScrollChapter({ chapterNumber, headline, headlineAccent, body, imageUrl, imageAlt, reverse = false, accentColor = 'var(--accent)' }: ScrollChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const imageY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const textX = useTransform(scrollYProgress, [0, 1], [reverse ? '3%' : '-3%', '0%']);
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.8, 1], [0, 1, 1, 0.4]);

  return (
    <section ref={ref} style={{ padding: '100px 0', background: 'var(--bg)', overflow: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
          style={{ flexDirection: reverse ? 'row-reverse' : 'row' }}>

          <motion.div style={{ opacity, x: textX }}>
            {chapterNumber && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: accentColor, marginBottom: 16 }}>
                {chapterNumber}
              </div>
            )}
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.035em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 24 }}>
              {headline}
              {headlineAccent && <><br /><span className="gradient-text">{headlineAccent}</span></>}
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.8 }}>{body}</p>
          </motion.div>

          {imageUrl && (
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bd)', height: 420 }}>
              <motion.img
                src={imageUrl} alt={imageAlt || headline}
                style={{ width: '100%', height: '120%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, y: imageY }}
              />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 60%)` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
