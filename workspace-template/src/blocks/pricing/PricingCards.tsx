/**
 * PricingCards — 2 or 3 tier pricing with highlighted middle plan.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { fadeUp, stagger, scaleIn, VIEWPORT } from '@/lib/motion';

export interface PricingPlan {
  name: string;
  price: { monthly: string; yearly: string; };
  description: string;
  features: string[];
  cta: { label: string; href: string; };
  highlighted?: boolean;
  badge?: string;
}

export interface PricingCardsProps {
  badge?: string;
  headline: string;
  headlineAccent?: string;
  sub?: string;
  plans: PricingPlan[];
}

export default function PricingCards({ badge, headline, headlineAccent, sub, plans }: PricingCardsProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={VIEWPORT} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
          {badge && <motion.div variants={fadeUp} style={{ marginBottom: 16 }}><span className="section-label">{badge}</span></motion.div>}
          <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 16 }}>
            {headline}{headlineAccent && <> <span className="gradient-text">{headlineAccent}</span></>}
          </motion.h2>
          {sub && <motion.p variants={fadeUp} style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: 28 }}>{sub}</motion.p>}

          <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 999, padding: '5px 16px' }}>
            <button
              onClick={() => setYearly(false)}
              style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', background: !yearly ? 'var(--primary)' : 'transparent', color: !yearly ? '#fff' : 'var(--muted)', transition: 'all 0.2s' }}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{ fontSize: 13, fontWeight: 500, padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', background: yearly ? 'var(--primary)' : 'transparent', color: yearly ? '#fff' : 'var(--muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Annuel
              <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 999, padding: '1px 7px' }}>-20%</span>
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className={`grid grid-cols-1 ${plans.length === 2 ? 'md:grid-cols-2 max-w-3xl' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6 mx-auto`}
          style={{ alignItems: 'stretch' }}
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              variants={plan.highlighted ? scaleIn : fadeUp}
              style={{
                padding: '32px 28px',
                borderRadius: 'var(--radius-lg)',
                border: plan.highlighted ? '1px solid var(--primary-border)' : '1px solid var(--bd)',
                background: plan.highlighted ? 'linear-gradient(145deg, rgba(99,102,241,0.08) 0%, var(--surface) 100%)' : 'var(--surface)',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                boxShadow: plan.highlighted ? '0 20px 60px -10px var(--primary-glow)' : 'none',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <span className="section-label" style={{ background: 'var(--primary)', color: '#fff', border: 'none', boxShadow: '0 4px 16px var(--primary-glow)' }}>{plan.badge}</span>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
                    {yearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>/mois</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>{plan.description}</p>
              </div>

              <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={15} style={{ color: plan.highlighted ? 'var(--primary)' : 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.cta.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '12px 20px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 14,
                  background: plan.highlighted ? 'var(--primary)' : 'var(--surface2)',
                  color: plan.highlighted ? '#fff' : 'var(--text2)',
                  border: plan.highlighted ? 'none' : '1px solid var(--bd-bright)',
                  boxShadow: plan.highlighted ? '0 4px 20px var(--primary-glow)' : 'none',
                  transition: 'all 0.18s',
                }}
              >
                {plan.cta.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
