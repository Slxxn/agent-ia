'use client';

import { motion } from 'framer-motion';
import type { FormSubmitData } from '@/lib/form-submit';

const SITE_TYPES = [
  {
    id: 'standard' as const,
    label: 'Site Vitrine',
    desc: 'Présentez votre activité, générez des contacts',
    icon: '🖥️',
    examples: 'Coiffeur, restaurant, artisan…',
  },
  {
    id: 'scrollytelling' as const,
    label: 'Scrollytelling',
    desc: 'Racontez une histoire en scrollant',
    icon: '🎬',
    examples: 'Portfolio, marque, lancement produit…',
  },
  {
    id: '3d' as const,
    label: 'Expérience 3D',
    desc: 'Site immersif avec animations 3D',
    icon: '✨',
    examples: 'Tech, luxe, innovation…',
  },
];

const GOALS = [
  { id: 'bookings',  label: 'Prendre des RDV' },
  { id: 'prospects', label: 'Trouver des clients' },
  { id: 'showcase',  label: 'Me présenter' },
  { id: 'ecommerce', label: 'Vendre en ligne' },
  { id: 'portfolio', label: 'Montrer mes réalisations' },
];

interface Props {
  data: Partial<FormSubmitData>;
  update: (fields: Partial<FormSubmitData>) => void;
  onNext: () => void;
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function Step1Projet({ data, update, onNext }: Props) {
  const canContinue = data.siteType && data.businessName?.trim() && data.siteGoal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
          Quel site voulez-vous ?
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Pas d&apos;engagement — vous pouvez modifier jusqu&apos;au paiement.
        </p>
      </motion.div>

      {/* Types de site */}
      <div>
        <Label>Type d&apos;expérience</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {SITE_TYPES.map((t, i) => (
            <motion.button
              key={t.id}
              custom={i}
              variants={variants}
              initial="hidden"
              animate="visible"
              type="button"
              onClick={() => update({ siteType: t.id })}
              style={{
                textAlign: 'left', padding: '18px 16px', borderRadius: 14,
                border: `2px solid ${data.siteType === t.id ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                background: data.siteType === t.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 6 }}>{t.desc}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>{t.examples}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Nom de l'entreprise */}
      <motion.div custom={3} variants={variants} initial="hidden" animate="visible">
        <Label>Nom de votre entreprise</Label>
        <input
          type="text"
          placeholder="Ex : Studio Lumière, Café des Arts…"
          value={data.businessName || ''}
          onChange={e => update({ businessName: e.target.value })}
          style={inputStyle}
          onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
      </motion.div>

      {/* Objectif */}
      <motion.div custom={4} variants={variants} initial="hidden" animate="visible">
        <Label>Votre objectif principal</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GOALS.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => update({ siteGoal: g.id })}
              style={{
                padding: '9px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                border: `1.5px solid ${data.siteGoal === g.id ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                background: data.siteGoal === g.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: data.siteGoal === g.id ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </motion.div>

      <NavButton onClick={onNext} disabled={!canContinue} label="Continuer →" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10, letterSpacing: '0.01em' }}>
      {children}
    </div>
  );
}

export function NavButton({ onClick, disabled, label, secondary }: { onClick: () => void; disabled?: boolean; label: string; secondary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: secondary ? 'auto' : '100%',
        padding: secondary ? '12px 20px' : '15px',
        borderRadius: 12,
        border: secondary ? '1px solid rgba(255,255,255,0.12)' : 'none',
        background: disabled ? 'rgba(255,255,255,0.05)' : secondary ? 'transparent' : '#fff',
        color: disabled ? 'rgba(255,255,255,0.2)' : secondary ? 'rgba(255,255,255,0.5)' : '#0a0a0a',
        fontSize: 14, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 10,
  border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  lineHeight: 1.6,
};
