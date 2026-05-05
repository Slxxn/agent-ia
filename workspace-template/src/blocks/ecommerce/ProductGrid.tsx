import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface Product {
  name: string;
  description?: string;
  price: string;
  priceOld?: string;
  badge?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ProductGridProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  products: Product[];
}

export default function ProductGrid({ badge, headline, headlineAccent, sub, products }: ProductGridProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 60px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div key={i} variants={fadeUp} style={{
              background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              transition: 'border-color 0.2s, transform 0.2s',
            }} whileHover={{ y: -4, borderColor: 'var(--primary-border)' } as any}>
              <div style={{ height: 200, background: 'var(--surface3)', position: 'relative', overflow: 'hidden' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🛍️</div>
                )}
                {p.badge && (
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.badge}</div>
                )}
              </div>
              <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{p.name}</h3>
                {p.description && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{p.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800 }}>{p.price}</span>
                  {p.priceOld && <span style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through' }}>{p.priceOld}</span>}
                </div>
                <a href={p.ctaHref || '#'} className="btn-primary" style={{ textAlign: 'center', padding: '9px 16px', fontSize: '0.875rem', textDecoration: 'none' }}>
                  {p.ctaLabel || 'Ajouter au panier'}
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
