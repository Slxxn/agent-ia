import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger, VIEWPORT } from '@/lib/motion';

export interface NewsletterSignupProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  placeholder?: string;
  ctaLabel?: string;
  successMessage?: string;
}

export default function NewsletterSignup({ badge, headline, headlineAccent, sub, placeholder = 'Votre adresse email', ctaLabel = "S'inscrire", successMessage = 'Merci ! Vous êtes inscrit.' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT}
          style={{ textAlign: 'center', background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 'var(--radius-lg)', padding: '52px 40px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 14 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>{sub}</motion.p>}

          {submitted ? (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 600 }}>{successMessage}</motion.p>
          ) : (
            <motion.form variants={fadeUp} onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true); }}
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder={placeholder}
                style={{ flex: '1 1 260px', minWidth: 0, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--bd)')}
              />
              <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: '12px 24px', fontSize: '0.95rem' }}>
                {ctaLabel}
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
