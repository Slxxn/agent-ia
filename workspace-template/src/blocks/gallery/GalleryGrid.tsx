/**
 * GalleryGrid — Responsive image grid with lightbox.
 * Best for: photography, portfolio, before/after.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fadeUp, scaleIn, stagger, VIEWPORT } from '@/lib/motion';

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface GalleryGridProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
}

export default function GalleryGrid({ badge, headline, headlineAccent, sub, images, columns = 3 }: GalleryGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 md:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4' }[columns];

  const prev = () => setLightbox(l => l !== null ? (l - 1 + images.length) % images.length : null);
  const next = () => setLightbox(l => l !== null ? (l + 1) % images.length : null);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 14 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)' }}>{sub}</motion.p>}
        </motion.div>

        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className={`grid ${colClass} gap-3`}
        >
          {images.map((img, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              onClick={() => setLightbox(i)}
              style={{ aspectRatio: '4/3', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid var(--bd)' }}
              whileHover={{ scale: 1.02 } as any}
            >
              <img src={img.url} alt={img.alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s' }} className="hover:bg-black/30" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={20} />
            </button>
            <motion.img
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[lightbox].url}
              alt={images[lightbox].alt ?? ''}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius)', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
            />
            <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
