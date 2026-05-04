/**
 * HeroB — Split hero: text left, image/visual right.
 * Best for: e-commerce, portfolios, product showcases.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeUp, slideLeft, slideRight, stagger, VIEWPORT } from '@/lib/motion';

export interface HeroBProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub: string;
  cta: { label: string; href: string; };
  ctaSecondary?: { label: string; href: string; };
  imageUrl: string;
  imageAlt?: string;
  trustText?: string;
  avatarUrls?: string[];
}

export default function HeroB({ badge, headline, headlineAccent, sub, cta, ctaSecondary, imageUrl, imageAlt, trustText, avatarUrls }: HeroBProps) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'var(--bg)', overflow: 'hidden', paddingTop: 80 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16 lg:py-24">
          {/* Text side */}
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate="show"
          >
            {badge && (
              <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
                <span className="section-label">{badge}</span>
              </motion.div>
            )}

            <motion.h1
              variants={slideLeft}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}
            >
              {headline}
              {headlineAccent && (
                <><br /><span className="gradient-text">{headlineAccent}</span></>
              )}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}
            >
              {sub}
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Link to={cta.href} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
                {cta.label} <ArrowRight size={16} />
              </Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.href} className="btn-ghost" style={{ fontSize: 15, padding: '12px 26px' }}>
                  {ctaSecondary.label}
                </Link>
              )}
            </motion.div>

            {trustText && avatarUrls && (
              <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
                <div style={{ display: 'flex' }}>
                  {avatarUrls.slice(0, 4).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--bg)', marginLeft: i === 0 ? 0 : -10, objectFit: 'cover' }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{trustText}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Image side */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate="show"
            style={{ position: 'relative' }}
          >
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px var(--bd)',
            }}>
              <img
                src={imageUrl}
                alt={imageAlt ?? headline}
                style={{ width: '100%', height: 520, objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* Decorative glow */}
            <div aria-hidden style={{ position: 'absolute', inset: -40, background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.1, borderRadius: '50%', zIndex: -1 }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
