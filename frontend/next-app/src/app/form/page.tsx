'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePrice, submitConversationalForm } from '@/lib/api';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Answers = Record<string, unknown>;
interface Choice { value: string; label: string; icon?: string }
interface StepDef {
  id: string; question: string; subtitle?: string;
  type: 'text' | 'textarea' | 'choice' | 'contact' | 'info' | 'summary';
  icon: string; choices?: Choice[]; placeholder?: string;
}
interface PricingData {
  suggested: number; base: number; options_total: number;
  breakdown: { base: { label: string; price: number }; options: { key: string; label: string; price: number }[]; cap_applied: boolean; saved: number };
}

// ─── Arbre de questions ────────────────────────────────────────────────────────

const GOAL_CHOICES: Record<string, Choice[]> = {
  beaute:      [{ value: 'bookings', label: 'Prendre des RDV', icon: '📅' }, { value: 'showcase', label: "Présenter mon activité", icon: '🏪' }, { value: 'portfolio', label: 'Montrer mes réalisations', icon: '🖼️' }],
  restaurant:  [{ value: 'bookings', label: 'Réservations de tables', icon: '📅' }, { value: 'showcase', label: 'Présenter le restaurant', icon: '🏪' }],
  artisan:     [{ value: 'prospects', label: 'Trouver des clients', icon: '🎯' }, { value: 'showcase', label: "Présenter mon activité", icon: '🏪' }, { value: 'portfolio', label: 'Montrer mes réalisations', icon: '🖼️' }],
  coach:       [{ value: 'bookings', label: 'Prendre des RDV', icon: '📅' }, { value: 'prospects', label: 'Trouver des clients', icon: '🎯' }, { value: 'ecommerce', label: 'Vendre des formations', icon: '🛒' }],
  photo:       [{ value: 'portfolio', label: 'Montrer mon portfolio', icon: '🖼️' }, { value: 'bookings', label: 'Prendre des RDV', icon: '📅' }, { value: 'prospects', label: 'Trouver des clients', icon: '🎯' }],
  medical:     [{ value: 'bookings', label: 'Prendre des RDV', icon: '📅' }, { value: 'showcase', label: 'Présenter mon cabinet', icon: '🏪' }],
  immobilier:  [{ value: 'prospects', label: 'Trouver des clients', icon: '🎯' }, { value: 'showcase', label: "Présenter l'agence", icon: '🏪' }],
  mode:        [{ value: 'ecommerce', label: 'Vendre mes produits', icon: '🛒' }, { value: 'showcase', label: 'Présenter la marque', icon: '🏪' }, { value: 'portfolio', label: 'Montrer mes créations', icon: '🖼️' }],
  sport:       [{ value: 'bookings', label: 'Réserver des cours', icon: '📅' }, { value: 'ecommerce', label: 'Vendre des abonnements', icon: '🛒' }, { value: 'showcase', label: 'Présenter le club', icon: '🏪' }],
  tech:        [{ value: 'prospects', label: 'Trouver des clients', icon: '🎯' }, { value: 'ecommerce', label: 'Vendre un produit', icon: '🛒' }, { value: 'showcase', label: 'Présenter la startup', icon: '🏪' }],
  association: [{ value: 'showcase', label: "Présenter l'association", icon: '🏪' }, { value: 'prospects', label: 'Recruter des membres', icon: '🎯' }],
  autre:       [{ value: 'showcase', label: "Présenter mon activité", icon: '🏪' }, { value: 'prospects', label: 'Trouver des clients', icon: '🎯' }, { value: 'ecommerce', label: 'Vendre des produits', icon: '🛒' }, { value: 'portfolio', label: 'Montrer mes réalisations', icon: '🖼️' }, { value: 'bookings', label: 'Prendre des RDV', icon: '📅' }],
};

const BASE_STEPS: StepDef[] = [
  { id: 'business_name', icon: '🏢', type: 'text',    question: 'Quel est le nom de votre entreprise ?',    subtitle: "Tel qu'il apparaîtra sur votre site.",             placeholder: 'Ex: Salon Emma, Restaurant Le Mas…' },
  { id: 'has_logo',      icon: '🎨', type: 'choice',  question: 'Avez-vous un logo ?',                       subtitle: 'Si non, nous pouvons en créer un pour vous.',      choices: [{ value: 'yes', label: "Oui, j'en ai un", icon: '✅' }, { value: 'no', label: 'Non, pas encore', icon: '❌' }, { value: 'later', label: "Je l'enverrai plus tard", icon: '📩' }] },
  { id: 'sector',        icon: '🏪', type: 'choice',  question: 'Quelle est votre activité ?',               subtitle: 'Choisissez ce qui correspond le mieux.',           choices: [{ value: 'beaute', label: 'Beauté & Bien-être', icon: '💆' }, { value: 'restaurant', label: 'Restaurant & Café', icon: '🍽️' }, { value: 'artisan', label: 'Artisan & BTP', icon: '🔨' }, { value: 'coach', label: 'Coach & Formation', icon: '💪' }, { value: 'photo', label: 'Photo & Vidéo', icon: '📷' }, { value: 'medical', label: 'Médical & Paramédical', icon: '🏥' }, { value: 'immobilier', label: 'Immobilier', icon: '🏠' }, { value: 'mode', label: 'Mode & Boutique', icon: '👗' }, { value: 'sport', label: 'Sport & Fitness', icon: '⚽' }, { value: 'tech', label: 'Tech & Digital', icon: '💻' }, { value: 'association', label: 'Association', icon: '🤝' }, { value: 'autre', label: 'Autre activité', icon: '✨' }] },
  { id: 'goal',          icon: '🎯', type: 'choice',  question: 'Quel est votre objectif principal ?',       subtitle: 'Ce que vous voulez que vos visiteurs fassent.',   choices: [] },
  { id: 'description',   icon: '✍️', type: 'textarea', question: 'Décrivez votre activité en 2-3 phrases',   subtitle: 'Ce texte sera utilisé pour le contenu de votre site.', placeholder: 'Ex: Salon de coiffure spécialisé en colorations naturelles, ouvert depuis 5 ans à Montpellier…' },
  { id: 'style_vibe',    icon: '🎨', type: 'choice',  question: 'Quelle ambiance pour votre site ?',         subtitle: "Choisissez ce qui correspond à l'image de votre entreprise.", choices: [{ value: 'luxe', label: 'Luxe & Élégant', icon: '✨' }, { value: 'minimaliste', label: 'Simple & Épuré', icon: '⬜' }, { value: 'moderne', label: 'Moderne & Audacieux', icon: '⚡' }, { value: 'naturel', label: 'Naturel & Chaleureux', icon: '🌿' }, { value: 'colore', label: 'Coloré & Vibrant', icon: '🌈' }, { value: 'pro', label: 'Professionnel & Sobre', icon: '💼' }] },
  { id: 'color_theme',   icon: '🌓', type: 'choice',  question: 'Fond clair ou sombre ?',                    subtitle: 'Vous pourrez toujours affiner les couleurs ensuite.', choices: [{ value: 'dark', label: 'Sombre', icon: '🌑' }, { value: 'light', label: 'Clair', icon: '☀️' }, { value: 'neutral', label: 'Neutre', icon: '⚪' }] },
  { id: 'contact_info',  icon: '📬', type: 'contact', question: 'Vos coordonnées',                           subtitle: 'Pour vous envoyer votre devis et vous contacter si besoin.' },
  { id: 'summary',       icon: '📋', type: 'summary', question: 'Voici votre devis estimatif',               subtitle: 'Nous vous contacterons sous 24h pour valider ensemble avant paiement.' },
];

const EXTRA: Record<string, StepDef> = {
  no_logo_info:     { id: 'no_logo_info',     icon: '✨', type: 'info',   question: 'Pas de souci !',                                      subtitle: 'Nous créerons un logo professionnel adapté à votre activité. Cela sera inclus dans votre devis.' },
  ecommerce_detail: { id: 'ecommerce_detail', icon: '🛒', type: 'choice', question: 'Combien de produits avez-vous environ ?',             subtitle: 'Pour dimensionner votre boutique.',                choices: [{ value: 'small', label: 'Moins de 20 produits', icon: '📦' }, { value: 'medium', label: '20 à 100 produits', icon: '📦📦' }, { value: 'large', label: 'Plus de 100 produits', icon: '🏭' }] },
  payment_needed:   { id: 'payment_needed',   icon: '💳', type: 'choice', question: 'Voulez-vous accepter les paiements en ligne ?',       subtitle: 'Carte bancaire via Stripe — vos clients paient directement.',                                   choices: [{ value: 'yes', label: 'Oui, paiement en ligne', icon: '✅' }, { value: 'no', label: 'Non, contact uniquement', icon: '📞' }] },
  booking_detail:   { id: 'booking_detail',   icon: '📅', type: 'choice', question: 'Comment vos clients prennent-ils rendez-vous ?',      subtitle: 'Pour savoir comment intégrer la réservation.',     choices: [{ value: 'phone', label: 'Par téléphone', icon: '📞' }, { value: 'doctolib', label: 'Via Doctolib', icon: '🏥' }, { value: 'none', label: 'Pas encore de système', icon: '❌' }] },
  portfolio_detail: { id: 'portfolio_detail', icon: '🖼️', type: 'choice', question: 'Quel type de réalisations voulez-vous montrer ?',     subtitle: 'Pour choisir la meilleure mise en page.',          choices: [{ value: 'photos', label: 'Photos / images', icon: '📷' }, { value: 'videos', label: 'Vidéos', icon: '🎬' }, { value: 'projects', label: 'Projets avec détails', icon: '📁' }, { value: 'mixed', label: 'Un peu de tout', icon: '✨' }] },
};

function buildIds(ans: Answers): string[] {
  const ids = ['business_name', 'has_logo'];
  if (ans.has_logo === 'no') ids.push('no_logo_info');
  ids.push('sector', 'goal');
  if (ans.goal === 'ecommerce') ids.push('ecommerce_detail', 'payment_needed');
  else if (ans.goal === 'bookings') ids.push('booking_detail');
  else if (ans.goal === 'portfolio') ids.push('portfolio_detail');
  ids.push('description', 'style_vibe', 'color_theme', 'contact_info', 'summary');
  return ids;
}

function getStep(id: string, ans: Answers): StepDef {
  if (EXTRA[id]) return EXTRA[id];
  const s = BASE_STEPS.find(s => s.id === id)!;
  if (id === 'goal') return { ...s, choices: GOAL_CHOICES[(ans.sector as string) || 'autre'] || GOAL_CHOICES.autre };
  return s;
}

// ─── Input components ─────────────────────────────────────────────────────────

const ISX: React.CSSProperties = { width: '100%', padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#F2F2F6', fontSize: 15, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' };

function Btn({ disabled, label, onClick }: { disabled?: boolean; label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 9, background: disabled ? 'rgba(99,102,241,0.2)' : '#6366f1', color: disabled ? 'rgba(255,255,255,0.3)' : '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
      {label || 'Continuer →'}
    </button>
  );
}

function TextInput({ step, value, onChange, onNext }: { step: StepDef; value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input autoFocus type="text" value={value || ''} placeholder={step.placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value?.trim() && onNext()}
        style={ISX}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
      <Btn disabled={!value?.trim()} onClick={onNext} />
    </div>
  );
}

function TextareaInput({ step, value, onChange, onNext }: { step: StepDef; value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea autoFocus rows={4} value={value || ''} placeholder={step.placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ ...ISX, resize: 'vertical', minHeight: 120, lineHeight: 1.6 }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
      <Btn disabled={!value?.trim()} onClick={onNext} />
    </div>
  );
}

function ChoiceInput({ step, value, onChange }: { step: StepDef; value: string; onChange: (v: string) => void }) {
  const choices = step.choices || [];
  const grid = choices.length >= 6;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: grid ? 'repeat(2, 1fr)' : '1fr', gap: 8 }}>
      {choices.map(c => (
        <button key={c.value} onClick={() => onChange(c.value)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: value === c.value ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)', boxShadow: value === c.value ? 'inset 0 0 0 1.5px #6366f1' : 'inset 0 0 0 1px rgba(255,255,255,0.08)', color: value === c.value ? '#fff' : 'rgba(226,226,234,0.7)', transition: 'all 0.15s' }}
          onMouseEnter={e => { if (value !== c.value) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; } }}
          onMouseLeave={e => { if (value !== c.value) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(226,226,234,0.7)'; } }}>
          {c.icon && <span style={{ fontSize: 20, flexShrink: 0 }}>{c.icon}</span>}
          <span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span>
          {value === c.value && <span style={{ marginLeft: 'auto', color: '#6366f1', fontSize: 15, flexShrink: 0 }}>✓</span>}
        </button>
      ))}
    </div>
  );
}

function ContactInput({ value, onChange, onNext }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void; onNext: () => void }) {
  const v = value || {};
  const set = (k: string, val: string) => onChange({ ...v, [k]: val });
  const ok = !!v.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, color: 'rgba(226,226,234,0.4)', marginBottom: 6, display: 'block' }}>Email *</label>
        <input autoFocus type="email" value={v.email || ''} placeholder="votre@email.com" onChange={e => set('email', e.target.value)} style={ISX}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: 'rgba(226,226,234,0.4)', marginBottom: 6, display: 'block' }}>Téléphone (optionnel)</label>
        <input type="tel" value={v.phone || ''} placeholder="06 12 34 56 78" onChange={e => set('phone', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ok && onNext()} style={ISX}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)')} onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
      </div>
      <Btn disabled={!ok} label="Voir mon devis →" onClick={onNext} />
    </div>
  );
}

function SummaryStep({ answers, pricing, onSubmit, submitting }: { answers: Answers; pricing: PricingData | null; onSubmit: () => void; submitting: boolean }) {
  const contact = (answers.contact_info as Record<string, string>) || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {pricing ? (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '24px 20px' }}>
          <div style={{ fontSize: 12, color: 'rgba(226,226,234,0.4)', marginBottom: 4 }}>Estimation de votre devis</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16 }}>{pricing.suggested}€</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(226,226,234,0.6)' }}><span>{pricing.breakdown.base.label}</span><span>{pricing.breakdown.base.price}€</span></div>
            {pricing.breakdown.options.map(o => (
              <div key={o.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(226,226,234,0.6)' }}><span>+ {o.label}</span><span>+{o.price}€</span></div>
            ))}
            {pricing.breakdown.cap_applied && <div style={{ fontSize: 12, color: '#818CF8', marginTop: 4 }}>✓ Plafond appliqué — économie de {pricing.breakdown.saved}€</div>}
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '28px 24px', textAlign: 'center', color: 'rgba(226,226,234,0.3)', fontSize: 14 }}>Calcul du devis…</div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(226,226,234,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Récapitulatif</div>
        {([['Entreprise', answers.business_name], ['Email', contact.email], ['Téléphone', contact.phone], ['Secteur', answers.sector], ['Objectif', answers.goal], ['Ambiance', answers.style_vibe], ['Thème', answers.color_theme]] as [string, unknown][]).filter(([, v]) => v).map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(226,226,234,0.55)', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 8 }}>
            <span style={{ color: 'rgba(226,226,234,0.3)' }}>{label}</span>
            <span style={{ textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(val)}</span>
          </div>
        ))}
      </div>

      <button onClick={onSubmit} disabled={submitting}
        style={{ padding: '14px 28px', borderRadius: 10, background: submitting ? 'rgba(99,102,241,0.4)' : '#6366f1', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
        {submitting ? 'Envoi en cours…' : 'Envoyer ma demande →'}
      </button>
      <p style={{ fontSize: 12, color: 'rgba(226,226,234,0.2)', textAlign: 'center', margin: '-8px 0 0' }}>
        Aucun paiement maintenant · Devis confirmé sous 24h
      </p>
    </div>
  );
}

function SuccessScreen({ pricing, email }: { pricing: PricingData | null; email: string }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>Demande envoyée !</h1>
        <p style={{ fontSize: 15, color: 'rgba(226,226,234,0.45)', lineHeight: 1.75, marginBottom: 24 }}>
          Nous avons reçu votre demande et vous contacterons à{' '}
          <strong style={{ color: '#818CF8' }}>{email}</strong>{' '}sous 24h avec votre devis finalisé.
        </p>
        {pricing && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '24px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'rgba(226,226,234,0.35)', marginBottom: 4 }}>Estimation</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>{pricing.suggested}€</div>
            <div style={{ fontSize: 12, color: 'rgba(226,226,234,0.25)', marginTop: 4 }}>Prix définitif confirmé par notre équipe</div>
          </div>
        )}
        <a href="/" style={{ fontSize: 13, color: 'rgba(226,226,234,0.3)', textDecoration: 'none' }}>← Retour à l&apos;accueil</a>
      </motion.div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

export default function FormPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [ids, setIds] = useState<string[]>(() => buildIds({}));
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const curId = ids[idx] || 'business_name';
  const curStep = getStep(curId, answers);
  const progress = Math.max(6, Math.round((idx / Math.max(ids.length - 1, 1)) * 100));

  useEffect(() => { setIds(buildIds(answers)); }, [answers]);

  const fetchP = useCallback((ans: Answers) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { const d = await calculatePrice(ans as Record<string, unknown>); setPricing(d as unknown as PricingData); } catch {}
    }, 350);
  }, []);

  const advance = (ans: Answers) => {
    const newIds = buildIds(ans);
    setIds(newIds);
    const next = Math.min(idx + 1, newIds.length - 1);
    setDir(1);
    setIdx(next);
    if (newIds[next] === 'summary') fetchP(ans);
  };

  const handleChoice = (val: string) => {
    const ans = { ...answers, [curId]: val };
    setAnswers(ans);
    if (['goal', 'sector', 'style_vibe', 'has_logo', 'color_theme'].includes(curId)) fetchP(ans);
    advance(ans);
  };

  const handleText = (val: string) => setAnswers(a => ({ ...a, [curId]: val }));

  const goNext = () => advance(answers);
  const goBack = () => { if (idx > 0) { setDir(-1); setIdx(i => i - 1); } };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const contact = (answers.contact_info as Record<string, string>) || {};
      const flat = { ...answers, email: contact.email || '', phone: contact.phone || '' };
      const data = await submitConversationalForm(flat as Record<string, unknown>);
      setPricing(data.pricing as unknown as PricingData);

      // Write to Firestore so the CRM sees this lead
      try {
        await addDoc(collection(db, 'client_requests'), {
          businessName:   answers.business_name || '',
          sector:         answers.sector || '',
          siteGoal:       answers.goal || '',
          siteType:       data.site_type || 'standard',
          description:    answers.description || '',
          targetAudience: answers.target_audience || '',
          uniqueValue:    answers.unique_value || '',
          references:     answers.references || '',
          visualStyle:    answers.style || '',
          colorTheme:     answers.color_theme || 'dark',
          colors:         answers.colors || [],
          pages:          answers.pages || [],
          features:       answers.features || [],
          budget:         String((data.pricing as unknown as PricingData)?.suggested || ''),
          notes:          answers.notes || '',
          logoUrl:        '',
          status:         'pending',
          projectId:      data.project_id,
          suggestedPrice: (data.pricing as unknown as PricingData)?.suggested || 0,
          clientEmail:    contact.email || '',
          clientPhone:    contact.phone || '',
          createdAt:      Timestamp.now(),
        });
      } catch { /* Firestore write failure doesn't block the user */ }

      setSubmitted(true);
    } catch { alert('Une erreur est survenue. Réessayez.'); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    const contact = (answers.contact_info as Record<string, string>) || {};
    return <SuccessScreen pricing={pricing} email={contact.email || ''} />;
  }

  const contactVal = (answers.contact_info as Record<string, string>) || {};

  return (
    <div style={{ minHeight: '100dvh', background: '#060608', color: '#E2E2EA', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            {([[3,3,'#6366f1'],[19,3,'#818cf8'],[35,3,'#6366f1'],[3,19,'#818cf8'],[19,19,'#6366f1'],[35,19,'#818cf8'],[3,35,'#6366f1'],[19,35,'#818cf8'],[35,35,'#6366f1']] as [number,number,string][]).map(([x,y,c],i) => (
              <rect key={i} x={x} y={y} width="13" height="13" rx="3" fill={c} />
            ))}
          </svg>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.04em', color: '#fff' }}>builderz</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'rgba(226,226,234,0.2)' }}>{idx + 1} / {ids.length}</span>
          <AnimatePresence>
            {pricing && (
              <motion.div key="p" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 13, fontWeight: 700, color: '#818CF8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 99, padding: '4px 12px' }}>
                ~{pricing.suggested}€
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} style={{ height: '100%', background: '#6366f1' }} />
      </div>

      {/* Question area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 20px 48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={curId}
              initial={{ opacity: 0, x: dir * 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -36 }}
              transition={{ duration: 0.22, ease: EASE }}>

              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{curStep.icon}</div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>{curStep.question}</h1>
                {curStep.subtitle && <p style={{ fontSize: 15, color: 'rgba(226,226,234,0.45)', lineHeight: 1.65 }}>{curStep.subtitle}</p>}
              </div>

              {curStep.type === 'text'     && <TextInput step={curStep} value={answers[curId] as string} onChange={handleText} onNext={goNext} />}
              {curStep.type === 'textarea' && <TextareaInput step={curStep} value={answers[curId] as string} onChange={handleText} onNext={goNext} />}
              {curStep.type === 'choice'   && <ChoiceInput step={curStep} value={answers[curId] as string} onChange={handleChoice} />}
              {curStep.type === 'contact'  && <ContactInput value={contactVal} onChange={v => setAnswers(a => ({ ...a, contact_info: v }))} onNext={goNext} />}
              {curStep.type === 'info'     && <Btn onClick={goNext} />}
              {curStep.type === 'summary'  && <SummaryStep answers={answers} pricing={pricing} onSubmit={handleSubmit} submitting={submitting} />}

              {idx > 0 && !['choice', 'summary'].includes(curStep.type) && (
                <button onClick={goBack} style={{ marginTop: 20, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'rgba(226,226,234,0.22)', fontFamily: 'inherit', padding: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(226,226,234,0.55)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,226,234,0.22)')}>
                  ← Retour
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
