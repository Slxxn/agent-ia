import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface HeroPhotoProps {
  headline: string;
  headlineAccent?: string;
  sub?: string;
  cta: { label: string; href: string };
  galleryImages?: string[];
}

export default function HeroPhoto({ headline, headlineAccent, sub, cta, galleryImages = [] }: HeroPhotoProps) {
  const images = galleryImages.length > 0 ? galleryImages : Array(6).fill('');

  return (
    <section style={{ position: 'relative', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Masonry background grid */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: 4, opacity: 0.3 }}>
        {images.slice(0, 6).map((src, i) => (
          <div key={i} style={{ overflow: 'hidden', background: 'var(--surface2)' }}>
            {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 clamp(1.5rem, 5vw, 4rem)', maxWidth: 700 }}>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#fff', marginBottom: 16 }}
        >
          {headline}
          {headlineAccent && (
            <> <span className="gradient-text">{headlineAccent}</span></>
          )}
        </motion.h1>

        {sub && (
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 40 }}
          >
            {sub}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
            {cta.label} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
