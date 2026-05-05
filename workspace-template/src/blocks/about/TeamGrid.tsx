import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  linkedin?: string;
  twitter?: string;
}

export interface TeamGridProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  members: TeamMember[];
}

export default function TeamGrid({ badge, headline, headlineAccent, sub, members }: TeamGridProps) {
  return (
    <section style={{ padding: '80px 0', background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>{sub}</motion.p>}
        </motion.div>

        <motion.div variants={stagger(0.08)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m, i) => (
            <motion.div key={i} variants={fadeUp} style={{
              background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
            }} whileHover={{ y: -4, borderColor: 'var(--primary-border)' } as any}>
              <div style={{ height: 220, background: 'var(--surface3)', overflow: 'hidden', position: 'relative' }}>
                {m.avatarUrl ? (
                  <img src={m.avatarUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-muted)', border: '2px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                      {m.name.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '20px 22px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{m.name}</h3>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: m.bio ? 10 : 0 }}>{m.role}</p>
                {m.bio && <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>{m.bio}</p>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
