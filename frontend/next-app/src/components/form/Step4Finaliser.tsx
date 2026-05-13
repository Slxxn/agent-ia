'use client';

import { motion } from 'framer-motion';
import type { FormSubmitData } from '@/lib/form-submit';
import { NavButton, inputStyle, textareaStyle } from './Step1Projet';
import { FEATURE_GROUPS, FEATURE_GROUPS_3D, FEATURE_GROUPS_SCROLLYTELLING, PAGE_OPTIONS } from '@/types/clientRequest';

const PRICES: Record<string, { price: number; label: string; type: string }> = {
  standard:       { price: 490,  label: '490€',  type: 'Site Vitrine' },
  scrollytelling: { price: 690,  label: '690€',  type: 'Scrollytelling' },
  '3d':           { price: 990,  label: '990€',  type: 'Expérience 3D' },
};

const INCLUDED = [
  'Site livré en 72h',
  'Hébergement 1 an inclus',
  'Nom de domaine inclus',
  'Optimisé mobile et SEO',
  'Modifications illimitées pendant 30 jours',
];

const TESTIMONIALS: Record<string, { name: string; role: string; quote: string }> = {
  beauty:      { name: 'Emma R.',   role: 'Coiffeuse, Montpellier',      quote: 'Mon site était prêt en 48h. Mes clientes le trouvent super professionnel.' },
  restaurant:  { name: 'Marco V.',  role: 'Restaurateur, Lattes',        quote: "J'ai eu 3 nouvelles réservations la première semaine." },
  artisan:     { name: 'Pierre L.', role: 'Plombier, Castelnau-le-Lez',  quote: 'Simple, rapide, efficace. Exactement ce qu\'il me fallait.' },
  medical:     { name: 'Dr. Chen',  role: 'Ostéopathe, Bordeaux',        quote: 'Mes patients trouvent maintenant facilement mon cabinet en ligne.' },
  realestate:  { name: 'Julie M.',  role: 'Agent immobilier, Lyon',      quote: 'Le site a changé mon image professionnelle du tout au tout.' },
  coach:       { name: 'Antoine F.',role: 'Coach business, Paris',       quote: 'J\'ai doublé mes demandes de contact le premier mois.' },
  default:     { name: 'Sophie M.', role: 'Sophrologue, Montpellier',    quote: 'Le résultat dépasse ce que j\'espérais pour ce budget.' },
};

const SECTOR_LABELS: Record<string, string> = {
  standard: 'Site Vitrine', '3d': 'Expérience 3D', scrollytelling: 'Scrollytelling',
};

interface Props {
  data: Partial<FormSubmitData>;
  update: (fields: Partial<FormSubmitData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function Step4Finaliser({ data, update, onBack, onSubmit, submitting }: Props) {
  const siteType = (data.siteType as string) || 'standard';
  const price = PRICES[siteType] ?? PRICES.standard;
  const isScrollytelling = siteType === 'scrollytelling';
  const featureGroups = siteType === '3d' ? FEATURE_GROUPS_3D : isScrollytelling ? FEATURE_GROUPS_SCROLLYTELLING : FEATURE_GROUPS;
  const testimonial = TESTIMONIALS[data.sector || ''] ?? TESTIMONIALS.default;

  const pages = data.pages || ['home'];
  const features = data.features || [];

  const togglePage = (key: string) => {
    if (key === 'home') return;
    const next = pages.includes(key) ? pages.filter(p => p !== key) : [...pages, key];
    update({ pages: next });
  };

  const toggleFeature = (key: string) => {
    const next = features.includes(key) ? features.filter(f => f !== key) : [...features, key];
    update({ features: next });
  };

  const canSubmit = data.clientEmail?.trim() && data.clientEmail.includes('@');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
          Finalisez votre commande
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          Derniers détails avant le paiement sécurisé.
        </p>
      </motion.div>

      {/* Pages */}
      {!isScrollytelling && (
        <div>
          <SectionLabel>Pages de votre site</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
            {PAGE_OPTIONS.map(p => (
              <button key={p.key} type="button" disabled={p.key === 'home'} onClick={() => togglePage(p.key)}
                style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                  border: `1.5px solid ${pages.includes(p.key) ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  background: pages.includes(p.key) ? 'rgba(255,255,255,0.06)' : 'transparent',
                  cursor: p.key === 'home' ? 'default' : 'pointer',
                  opacity: p.key === 'home' ? 0.5 : 1,
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fonctionnalités */}
      <div>
        <SectionLabel>Fonctionnalités <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>— optionnelles</span></SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {featureGroups.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{group.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.items.map(item => (
                  <button key={item.key} type="button" onClick={() => toggleFeature(item.key)}
                    style={{
                      padding: '7px 12px', borderRadius: 8, fontSize: 12,
                      border: `1.5px solid ${features.includes(item.key) ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      background: features.includes(item.key) ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: features.includes(item.key) ? 'rgba(180,180,255,0.9)' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    }}>
                    {features.includes(item.key) && '✓ '}{item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <SectionLabel>Email <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>— pour recevoir votre lien de suivi</span></SectionLabel>
          <input type="email" placeholder="vous@exemple.fr" value={data.clientEmail || ''}
            onChange={e => update({ clientEmail: e.target.value })}
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <SectionLabel>Téléphone <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>— optionnel</span></SectionLabel>
          <input type="tel" placeholder="+33 6 00 00 00 00" value={data.clientPhone || ''}
            onChange={e => update({ clientPhone: e.target.value })}
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <SectionLabel>Notes <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>— optionnel</span></SectionLabel>
        <textarea rows={2} placeholder="Délais, contraintes, demandes spéciales…"
          value={data.notes || ''} onChange={e => update({ notes: e.target.value })}
          style={textareaStyle}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
      </div>

      {/* Séparateur */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Récapitulatif */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Récapitulatif</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            ['Type', SECTOR_LABELS[siteType]],
            ['Entreprise', data.businessName],
            ['Secteur', data.sector],
            ['Pages', isScrollytelling ? 'Une page' : `${pages.length} page(s)`],
            ['Fonctionnalités', features.length ? `${features.length} sélectionnée(s)` : 'Aucune'],
          ].map(([label, value]) => value ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', textAlign: 'right' }}>{value}</span>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Témoignage */}
      <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 8 }}>
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
          {testimonial.name} · {testimonial.role}
        </div>
      </div>

      {/* Bloc prix */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Forfait {price.type}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Paiement unique, aucun abonnement</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', fontFamily: 'monospace' }}>
            {price.label}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {INCLUDED.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: 'rgba(99,255,150,0.7)', fontSize: 14 }}>✓</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* Bouton paiement */}
      <motion.div whileTap={{ scale: canSubmit ? 0.98 : 1 }}>
        <button type="button" onClick={onSubmit} disabled={!canSubmit || submitting}
          style={{
            width: '100%', padding: '17px', borderRadius: 12, border: 'none',
            background: !canSubmit || submitting ? 'rgba(255,255,255,0.06)' : '#fff',
            color: !canSubmit || submitting ? 'rgba(255,255,255,0.2)' : '#0a0a0a',
            fontSize: 15, fontWeight: 800,
            cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}>
          {submitting ? 'Redirection vers le paiement…' : `Payer ${price.label} et lancer →`}
        </button>
        {!canSubmit && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 6 }}>
            Entrez votre email pour continuer
          </p>
        )}
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <NavButton onClick={onBack} label="← Retour" secondary />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>{children}</div>;
}
