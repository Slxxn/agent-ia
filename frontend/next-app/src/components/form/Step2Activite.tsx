'use client';

import { motion } from 'framer-motion';
import type { FormSubmitData } from '@/lib/form-submit';
import { NavButton, inputStyle, textareaStyle } from './Step1Projet';

const SECTORS = [
  { value: 'beauty',      label: 'Beauté & Bien-être' },
  { value: 'restaurant',  label: 'Restaurant & Café' },
  { value: 'artisan',     label: 'Artisan & BTP' },
  { value: 'medical',     label: 'Médical & Paramédical' },
  { value: 'realestate',  label: 'Immobilier' },
  { value: 'fashion',     label: 'Mode & Boutique' },
  { value: 'coach',       label: 'Coach & Formation' },
  { value: 'photo',       label: 'Photo & Vidéo' },
  { value: 'sport',       label: 'Sport & Fitness' },
  { value: 'tech',        label: 'Tech & Digital' },
  { value: 'association', label: 'Association' },
  { value: 'juridique',   label: 'Avocat & Comptable' },
  { value: 'other',       label: 'Autre activité' },
];

interface Props {
  data: Partial<FormSubmitData>;
  update: (fields: Partial<FormSubmitData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function Step2Activite({ data, update, onNext, onBack }: Props) {
  const canContinue = data.sector && data.description?.trim() && data.targetAudience?.trim() && data.uniqueValue?.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
          Parlez-nous de votre activité
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Ces infos permettent à l&apos;IA de créer un contenu qui vous ressemble vraiment.
        </p>
      </motion.div>

      {/* Secteur */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <Label required>Secteur d&apos;activité</Label>
        <select
          value={data.sector || ''}
          onChange={e => update({ sector: e.target.value })}
          style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
          onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <option value="" disabled style={{ background: '#111' }}>Choisir un secteur…</option>
          {SECTORS.map(s => (
            <option key={s.value} value={s.value} style={{ background: '#111' }}>{s.label}</option>
          ))}
        </select>
      </motion.div>

      {/* Description */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <Label required hint="2 à 4 phrases suffisent">Décrivez votre activité</Label>
        <textarea
          rows={4}
          placeholder="Ex : Salon de coiffure spécialisé en colorations naturelles, ouvert depuis 5 ans à Montpellier. 3 coiffeuses, ambiance zen et accueil chaleureux."
          value={data.description || ''}
          onChange={e => update({ description: e.target.value })}
          style={textareaStyle}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
      </motion.div>

      {/* Audience */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <Label required hint="Âge, profil, besoins…">Qui sont vos clients ?</Label>
        <textarea
          rows={3}
          placeholder="Ex : Femmes actives de 30–50 ans qui cherchent un salon de confiance proche de chez elles."
          value={data.targetAudience || ''}
          onChange={e => update({ targetAudience: e.target.value })}
          style={textareaStyle}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
      </motion.div>

      {/* Valeur unique */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <Label required hint="Ce qui vous différencie">Pourquoi vos clients vous choisissent ?</Label>
        <textarea
          rows={3}
          placeholder="Ex : Produits bio, tarifs justes, équipe disponible, pas besoin de rendez-vous."
          value={data.uniqueValue || ''}
          onChange={e => update({ uniqueValue: e.target.value })}
          style={textareaStyle}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
      </motion.div>

      {/* Références */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Label hint="Optionnel">Sites que vous aimez</Label>
        <textarea
          rows={2}
          placeholder="Collez des URLs de sites qui vous inspirent. Ex : apple.com, notion.so…"
          value={data.references || ''}
          onChange={e => update({ references: e.target.value })}
          style={textareaStyle}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
      </motion.div>

      <div style={{ display: 'flex', gap: 10 }}>
        <NavButton onClick={onBack} label="← Retour" secondary />
        <div style={{ flex: 1 }}>
          <NavButton onClick={onNext} disabled={!canContinue} label="Continuer →" />
        </div>
      </div>
    </div>
  );
}

function Label({ children, hint, required }: { children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
        {children}{required && <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>*</span>}
      </span>
      {hint && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>{hint}</span>}
    </div>
  );
}
