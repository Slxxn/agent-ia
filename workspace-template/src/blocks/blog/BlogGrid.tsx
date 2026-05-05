import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface BlogPost {
  title: string;
  excerpt: string;
  category?: string;
  date?: string;
  author?: string;
  imageUrl?: string;
  href?: string;
}

export interface BlogGridProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  posts: BlogPost[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function BlogGrid({ badge, headline, headlineAccent, sub, posts, ctaLabel, ctaHref }: BlogGridProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.a key={i} variants={fadeUp} href={post.href || '#'} style={{
              display: 'block', textDecoration: 'none',
              background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
            }} whileHover={{ y: -4, borderColor: 'var(--primary-border)' } as any}>
              <div style={{ height: 200, background: 'var(--surface3)', overflow: 'hidden' }}>
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-muted), var(--surface3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📝</div>
                )}
              </div>
              <div style={{ padding: '20px 22px' }}>
                {post.category && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{post.category}</span>}
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '8px 0 8px', lineHeight: 1.4 }}>{post.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{post.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                  {post.author && <span>{post.author}</span>}
                  {post.author && post.date && <span>·</span>}
                  {post.date && <span>{post.date}</span>}
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {ctaLabel && ctaHref && (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT}
            style={{ textAlign: 'center', marginTop: 48 }}>
            <a href={ctaHref} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {ctaLabel} <span>→</span>
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
