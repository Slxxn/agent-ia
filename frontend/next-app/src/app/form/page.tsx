'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  SITE_GOALS,
  SITE_TYPES,
  SECTORS,
  COLOR_THEMES,
  COLOR_THEMES_3D,
  COLOR_THEMES_SCROLLYTELLING,
  VISUAL_STYLES,
  VISUAL_STYLES_3D,
  VISUAL_STYLES_SCROLLYTELLING,
  FEATURE_GROUPS,
  FEATURE_GROUPS_3D,
  FEATURE_GROUPS_SCROLLYTELLING,
  PAGE_OPTIONS,
  SITE_TYPE_PRICES,
  type SiteType,
} from '@/types/clientRequest';

const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const ChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface FormData {
  siteType: SiteType;
  businessName: string;
  sector: string;
  siteGoal: string;
  tagline: string;
  description: string;
  targetAudience: string;
  uniqueValue: string;
  references: string;
  logoFile: File | null;
  colors: string[];
  colorTheme: string;
  visualStyle: string;
  pages: string[];
  features: string[];
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

const INITIAL: FormData = {
  siteType: 'standard',
  businessName: '', sector: '', siteGoal: '', tagline: '', description: '',
  targetAudience: '', uniqueValue: '', references: '',
  logoFile: null, colors: ['#6366f1'], colorTheme: 'light', visualStyle: '',
  pages: ['home'], features: [],
  clientEmail: '', clientPhone: '',
  notes: '',
};

const STEPS = [
  { id: 1, label: 'Projet',       short: '1' },
  { id: 2, label: 'Positionnement', short: '2' },
  { id: 3, label: 'Visuel',       short: '3' },
  { id: 4, label: 'Contenu',      short: '4' },
  { id: 5, label: 'Finaliser',    short: '5' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:8000/api';

export default function FormPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const dragRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const set = (field: keyof FormData, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  const setSiteType = (t: SiteType) =>
    setForm(f => ({
      ...f,
      siteType: t,
      visualStyle: '',
      colorTheme: t === '3d' ? 'deep_space' : t === 'scrollytelling' ? 'deep_black' : 'light',
      features: [],
      pages: t === 'scrollytelling' ? ['home'] : f.pages,
    }));

  const toggleArr = (field: 'pages' | 'features', key: string) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(key) ? f[field].filter(k => k !== key) : [...f[field], key],
    }));

  const handleLogoFile = (file: File) => {
    set('logoFile', file);
    const reader = new FileReader();
    reader.onload = e => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canNext = () => {
    if (step === 1) return form.businessName.trim() && form.sector && form.siteGoal;
    if (step === 2) return form.targetAudience.trim() && form.uniqueValue.trim();
    if (step === 3) return form.visualStyle && form.colorTheme;
    if (step === 4) return form.siteType === 'scrollytelling' || form.pages.length > 0;
    return !!form.clientEmail.trim();
  };

  const handleSubmit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      let logoUrl = '';
      if (form.logoFile) {
        const path = `logos/${Date.now()}_${form.logoFile.name}`;
        const snap = await uploadBytes(storageRef(storage, path), form.logoFile);
        logoUrl = await getDownloadURL(snap.ref);
      }

      const docRef = await addDoc(collection(db, 'client_requests'), {
        status: 'pending',
        createdAt: serverTimestamp(),
        siteType: form.siteType,
        businessName: form.businessName,
        sector: form.sector,
        siteGoal: form.siteGoal,
        tagline: form.tagline,
        description: form.description,
        targetAudience: form.targetAudience,
        uniqueValue: form.uniqueValue,
        references: form.references,
        logoUrl,
        colors: form.colors,
        colorTheme: form.colorTheme,
        visualStyle: form.visualStyle,
        pages: form.pages,
        features: form.features,
        budget: SITE_TYPE_PRICES[form.siteType].label,
        notes: form.notes,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
      });

      const portalRes = await fetch(`${API_BASE}/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firestore_id: docRef.id,
          client_email: form.clientEmail,
          client_phone: form.clientPhone,
          business_name: form.businessName,
          site_type: form.siteType,
        }),
      });
      if (!portalRes.ok) { setDone(true); return; }
      const { token } = await portalRes.json();

      const checkoutRes = await fetch(`${API_BASE}/checkout/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_token: token,
          business_name: form.businessName,
          site_type: form.siteType,
          client_email: form.clientEmail,
          origin: window.location.origin,
        }),
      });
      if (checkoutRes.ok) {
        const { url } = await checkoutRes.json();
        window.location.href = url;
      } else {
        router.push(`/p/${token}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Demande envoyée !</h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Nous avons reçu votre projet. Notre équipe le prend en charge et vous recontactera rapidement.
          </p>
          <button
            onClick={() => { setDone(false); setStep(1); setForm(INITIAL); setLogoPreview(null); }}
            className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
          >
            Nouveau projet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Créez votre site web</h1>
          <p className="text-gray-400">Décrivez votre projet, notre IA s&apos;occupe du reste.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s.id ? 'bg-indigo-600 text-white' :
                step === s.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30' :
                'bg-gray-800 text-gray-500'
              }`}>
                {step > s.id ? <CheckIcon /> : s.short}
              </div>
              <span className={`hidden sm:block text-xs font-medium transition-colors ${
                step >= s.id ? 'text-white' : 'text-gray-600'
              }`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 transition-colors ${step > s.id ? 'bg-indigo-600' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1 form={form} set={set} setSiteType={setSiteType} />}
            {step === 2 && <Step2 form={form} set={set} />}
            {step === 3 && (
              <Step3 form={form} set={set} logoPreview={logoPreview} fileRef={fileRef} dragRef={dragRef} handleLogoFile={handleLogoFile} />
            )}
            {step === 4 && <Step4 form={form} toggleArr={toggleArr} />}
            {step === 5 && <Step5 form={form} set={set} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors">
              <ChevronLeft /> Retour
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
            >
              Suivant <ChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canNext() || submitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
            >
              {submitting ? 'Envoi en cours…' : 'Envoyer ma demande →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Projet ───────────────────────────────────────────────────────────
function Step1({ form, set, setSiteType }: { form: FormData; set: (f: keyof FormData, v: unknown) => void; setSiteType: (t: SiteType) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Votre projet</h2>
        <p className="text-gray-400 text-sm">Les bases de votre future présence en ligne.</p>
      </div>

      <Field label="Type d'expérience *">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SITE_TYPES.map(t => (
            <button key={t.key} type="button" onClick={() => setSiteType(t.key)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                form.siteType === t.key ? 'border-indigo-500 bg-indigo-600/20' : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-semibold text-white text-sm">{t.label}</div>
              <div className="text-xs text-gray-400 mt-1 leading-snug">{t.desc}</div>
              <div className="mt-2 text-xs font-bold text-indigo-400">{SITE_TYPE_PRICES[t.key].label}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Nom de votre entreprise *">
        <input
          type="text" placeholder="Ex: Studio Lumière, Café des Arts…"
          value={form.businessName} onChange={e => set('businessName', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </Field>

      <Field label="Secteur d'activité *">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SECTORS.map(s => (
            <button key={s.key} type="button" onClick={() => set('sector', s.key)}
              className={`p-3 rounded-xl border text-center transition-all ${
                form.sector === s.key ? 'border-indigo-500 bg-indigo-600/20 text-white' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
              }`}>
              <div className="text-lg mb-1">{s.emoji}</div>
              <div className="text-xs font-medium leading-tight">{s.label}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Objectif principal du site *">
        <div className="space-y-2">
          {SITE_GOALS.map(g => (
            <button key={g.key} type="button" onClick={() => set('siteGoal', g.key)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                form.siteGoal === g.key ? 'border-indigo-500 bg-indigo-600/20' : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}>
              <div className="font-medium text-white">{g.label}</div>
              <div className="text-sm text-gray-400">{g.desc}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Accroche / Slogan" hint="La phrase qui résume votre valeur en une ligne">
        <input
          type="text" placeholder="Ex: L'artisanat au service de votre intérieur"
          value={form.tagline} onChange={e => set('tagline', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </Field>

      <Field label="Description de votre activité" hint="Que faites-vous concrètement ? Quels produits ou services proposez-vous ? (2–4 phrases)">
        <textarea
          rows={4} placeholder="Décrivez votre activité, vos produits ou services…"
          value={form.description} onChange={e => set('description', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>
    </div>
  );
}

// ─── Step 2: Positionnement ───────────────────────────────────────────────────
function Step2({ form, set }: { form: FormData; set: (f: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Votre audience & positionnement</h2>
        <p className="text-gray-400 text-sm">Ces informations permettent à l&apos;IA de créer du contenu ciblé et percutant.</p>
      </div>

      <Field label="Qui sont vos clients idéaux ? *" hint="Âge, profil, besoins, situation de vie…">
        <textarea
          rows={3} placeholder="Ex: Femmes de 25–45 ans cherchant des soins bien-être haut de gamme, professionnelles actives…"
          value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>

      <Field label="Votre avantage concurrentiel *" hint="Pourquoi un client devrait vous choisir plutôt qu'un concurrent ?">
        <textarea
          rows={3} placeholder="Ex: Seule boutique zéro-déchet de la ville, livraison en 2h, formules sur-mesure, 15 ans d'expérience…"
          value={form.uniqueValue} onChange={e => set('uniqueValue', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>

      <Field label="Références & inspirations" hint="Sites que vous aimez, concurrents dont vous voulez vous démarquer, marques qui vous inspirent">
        <textarea
          rows={3} placeholder="Ex: apple.com (design épuré), nomconcurrent.fr (mais je veux quelque chose de plus premium)…"
          value={form.references} onChange={e => set('references', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>
    </div>
  );
}

// ─── Step 3: Visuel ───────────────────────────────────────────────────────────
function Step3({ form, set, logoPreview, fileRef, dragRef, handleLogoFile }: {
  form: FormData; set: (f: keyof FormData, v: unknown) => void;
  logoPreview: string | null; fileRef: React.RefObject<HTMLInputElement>;
  dragRef: React.RefObject<HTMLDivElement>; handleLogoFile: (f: File) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Identité visuelle</h2>
        <p className="text-gray-400 text-sm">L&apos;apparence et l&apos;ambiance de votre site.</p>
      </div>

      <Field label="Logo" hint="PNG ou SVG recommandé — fond transparent idéal">
        <div
          ref={dragRef} onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) handleLogoFile(file); }}
          className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
        >
          {logoPreview ? (
            <div className="flex flex-col items-center gap-3">
              <img src={logoPreview} alt="Logo preview" className="max-h-20 object-contain" />
              <span className="text-sm text-gray-400">Cliquer pour changer</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <UploadIcon />
              <span className="text-sm">Glisser-déposer ou cliquer pour uploader</span>
              <span className="text-xs">PNG, JPG, SVG — max 5 Mo</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const file = e.target.files?.[0]; if (file) handleLogoFile(file); }} />
      </Field>

      <Field label="Couleurs de votre marque" hint="Jusqu'à 4 couleurs — ces teintes s'appliquent aux accents et boutons. Le fond est défini par le thème ci-dessous.">
        <div className="flex flex-wrap gap-3">
          {form.colors.map((color, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <input type="color" value={color}
                  onChange={e => { const next = [...form.colors]; next[i] = e.target.value; set('colors', next); }}
                  className="w-14 h-14 rounded-xl border-2 border-gray-700 cursor-pointer bg-transparent"
                />
                {form.colors.length > 1 && (
                  <button type="button" onClick={() => set('colors', form.colors.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center transition-colors">×</button>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">{color}</span>
              {i === 0 && <span className="text-xs text-indigo-400">principale</span>}
            </div>
          ))}
          {form.colors.length < 4 && (
            <button type="button" onClick={() => set('colors', [...form.colors, '#ffffff'])}
              className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-600 hover:border-indigo-500 flex items-center justify-center text-gray-500 hover:text-indigo-400 transition-colors text-2xl">+</button>
          )}
        </div>
      </Field>

      <Field label="Thème général *" hint="Définit la couleur de fond dominante du site">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(form.siteType === '3d' ? COLOR_THEMES_3D : form.siteType === 'scrollytelling' ? COLOR_THEMES_SCROLLYTELLING : COLOR_THEMES).map(t => (
            <button key={t.key} type="button" onClick={() => set('colorTheme', t.key)}
              className={`p-4 rounded-xl border transition-all ${
                form.colorTheme === t.key ? 'border-indigo-500 bg-indigo-600/20' : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}>
              <div className="w-full h-8 rounded-lg mb-2 border border-gray-600" style={{ backgroundColor: t.preview }} />
              <div className="font-medium text-white text-sm">{t.label}</div>
              <div className="text-xs text-gray-400">{t.desc}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Style visuel *">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(form.siteType === '3d' ? VISUAL_STYLES_3D : form.siteType === 'scrollytelling' ? VISUAL_STYLES_SCROLLYTELLING : VISUAL_STYLES).map(s => (
            <button key={s.key} type="button" onClick={() => set('visualStyle', s.key)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                form.visualStyle === s.key ? 'border-indigo-500 bg-indigo-600/20' : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}>
              <div className="font-medium text-white text-sm">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── Step 4: Contenu ──────────────────────────────────────────────────────────
function Step4({ form, toggleArr }: { form: FormData; toggleArr: (field: 'pages' | 'features', key: string) => void }) {
  const isScrollytelling = form.siteType === 'scrollytelling';
  const featureGroups = form.siteType === '3d' ? FEATURE_GROUPS_3D : isScrollytelling ? FEATURE_GROUPS_SCROLLYTELLING : FEATURE_GROUPS;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {isScrollytelling ? 'Contenu & fonctionnalités' : 'Structure & fonctionnalités'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isScrollytelling
            ? 'Une seule page narrative — choisissez les éléments qui la composent.'
            : 'Quelles pages et quels outils votre site doit-il avoir ?'}
        </p>
      </div>

      {isScrollytelling ? (
        <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-4 py-3">
          <span className="text-2xl">📜</span>
          <div>
            <div className="text-sm font-semibold text-indigo-300">Site une seule page</div>
            <div className="text-xs text-gray-400 mt-0.5">Le scrollytelling est une expérience narrative continue — pas de pages multiples.</div>
          </div>
        </div>
      ) : (
        <Field label="Pages du site *" hint="La page Accueil est toujours incluse">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PAGE_OPTIONS.map(p => (
              <button key={p.key} type="button" disabled={p.key === 'home'}
                onClick={() => p.key !== 'home' && toggleArr('pages', p.key)}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                  form.pages.includes(p.key) ? 'border-indigo-500 bg-indigo-600/20' : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                } ${p.key === 'home' ? 'opacity-60 cursor-default' : ''}`}>
                <div className="font-medium text-white text-sm">{p.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Fonctionnalités" hint="Sélectionnez tout ce dont vous avez besoin">
        <div className="space-y-4">
          {featureGroups.map(group => (
            <div key={group.label}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group.label}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {group.items.map(item => (
                  <button key={item.key} type="button" onClick={() => toggleArr('features', item.key)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                      form.features.includes(item.key)
                        ? 'border-indigo-500 bg-indigo-600/20 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}>
                    {form.features.includes(item.key) && (
                      <span className="inline-block w-4 h-4 rounded-full bg-indigo-600 text-white text-xs mr-2 text-center leading-4">✓</span>
                    )}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}

// ─── AI Suggestions types ─────────────────────────────────────────────────────
interface AIPalette {
  name: string;
  description: string;
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

interface AISuggestions {
  palettes?: AIPalette[];
  suggestedVisualStyle?: string;
  suggestedColorTheme?: string;
  ambiance?: string;
  typography?: { display: string; body: string };
  stats?: { emoji: string; value: string; label: string }[];
  sections?: string[];
  tip?: string;
}

// ─── Step 5: Finaliser ────────────────────────────────────────────────────────
function Step5({ form, set }: { form: FormData; set: (f: keyof FormData, v: unknown) => void }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [error, setError] = useState('');
  const [appliedPalette, setAppliedPalette] = useState<number | null>(null);
  const [appliedStyle, setAppliedStyle] = useState(false);
  const [appliedTheme, setAppliedTheme] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    setSuggestions(null);
    setAppliedPalette(null);
    setAppliedStyle(false);
    setAppliedTheme(false);
    try {
      const res = await fetch(`${API_BASE}/gemini-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          sector: form.sector,
          siteGoal: form.siteGoal,
          tagline: form.tagline,
          description: form.description,
          targetAudience: form.targetAudience,
          uniqueValue: form.uniqueValue,
          references: form.references,
          colors: form.colors,
          colorTheme: form.colorTheme,
          visualStyle: form.visualStyle,
          pages: form.pages,
          features: form.features,
          budget: SITE_TYPE_PRICES[form.siteType].label,
          siteType: form.siteType,
        }),
      });
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions);
      else setError(data.error || 'Erreur inconnue');
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const applyPalette = (palette: AIPalette, index: number) => {
    const newColors = [palette.primary, palette.secondary, palette.accent].filter(Boolean);
    set('colors', newColors);
    setAppliedPalette(index);
  };

  const applyStyle = () => {
    if (suggestions?.suggestedVisualStyle) {
      set('visualStyle', suggestions.suggestedVisualStyle);
      setAppliedStyle(true);
    }
  };

  const applyTheme = () => {
    if (suggestions?.suggestedColorTheme) {
      set('colorTheme', suggestions.suggestedColorTheme);
      setAppliedTheme(true);
    }
  };

  const applyAll = () => {
    if (!suggestions) return;
    if (suggestions.palettes?.[0]) applyPalette(suggestions.palettes[0], 0);
    if (suggestions.suggestedVisualStyle) { set('visualStyle', suggestions.suggestedVisualStyle); setAppliedStyle(true); }
    if (suggestions.suggestedColorTheme) { set('colorTheme', suggestions.suggestedColorTheme); setAppliedTheme(true); }
  };

  const allStyles = form.siteType === '3d' ? VISUAL_STYLES_3D : form.siteType === 'scrollytelling' ? VISUAL_STYLES_SCROLLYTELLING : VISUAL_STYLES;
  const allThemes = form.siteType === '3d' ? COLOR_THEMES_3D : form.siteType === 'scrollytelling' ? COLOR_THEMES_SCROLLYTELLING : COLOR_THEMES;

  const suggestedStyleLabel = allStyles.find(s => s.key === suggestions?.suggestedVisualStyle)?.label;
  const suggestedThemeLabel = allThemes.find(t => t.key === suggestions?.suggestedColorTheme)?.label;
  const suggestedThemePreview = allThemes.find(t => t.key === suggestions?.suggestedColorTheme)?.preview;

  const canApplyAll = suggestions && (suggestions.palettes?.length || suggestions.suggestedVisualStyle || suggestions.suggestedColorTheme);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Derniers détails</h2>
        <p className="text-gray-400 text-sm">Vos coordonnées et informations complémentaires.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email *" hint="Pour recevoir votre lien de suivi">
          <input type="email" placeholder="vous@exemple.fr" value={form.clientEmail}
            onChange={e => set('clientEmail', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors" />
        </Field>
        <Field label="Téléphone" hint="Optionnel">
          <input type="tel" placeholder="+33 6 00 00 00 00" value={form.clientPhone}
            onChange={e => set('clientPhone', e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors" />
        </Field>
      </div>

      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">Prix forfaitaire</div>
          <div className="text-sm text-gray-300">{SITE_TYPES.find(t => t.key === form.siteType)?.label} · livraison 72h · Firebase inclus</div>
        </div>
        <div className="text-3xl font-bold text-white font-mono">{SITE_TYPE_PRICES[form.siteType].label}</div>
      </div>

      <Field label="Notes complémentaires" hint="Délais, contraintes, demandes spéciales…">
        <textarea rows={3} placeholder="Ex: Livraison souhaitée avant le 15 juin, compatibilité avec mon système existant…"
          value={form.notes} onChange={e => set('notes', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none" />
      </Field>

      {/* Récapitulatif */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2 text-sm">
        <div className="font-semibold text-white mb-3">Récapitulatif</div>
        <Row label="Type" value={SITE_TYPES.find(t => t.key === form.siteType)?.label} />
        <Row label="Entreprise" value={form.businessName} />
        <Row label="Secteur" value={SECTORS.find(s => s.key === form.sector)?.label} />
        <Row label="Objectif" value={SITE_GOALS.find(g => g.key === form.siteGoal)?.label} />
        <Row label="Style" value={allStyles.find(s => s.key === form.visualStyle)?.label} />
        <Row label="Thème" value={allThemes.find(t => t.key === form.colorTheme)?.label} />
        <Row label="Pages" value={form.siteType === 'scrollytelling' ? 'Une page' : `${form.pages.length} page(s)`} />
        <Row label="Prix" value={SITE_TYPE_PRICES[form.siteType].label} />
      </div>

      {/* IA Suggestions */}
      <div className="space-y-4">
        <button type="button" onClick={fetchSuggestions} disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold border border-indigo-500/60 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 transition-all disabled:opacity-50">
          {loading ? (
            <><span className="inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />Analyse en cours…</>
          ) : (
            <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            {suggestions ? 'Regénérer les suggestions IA' : 'Obtenir les suggestions IA pour mon projet'}</>
          )}
        </button>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        {suggestions && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Palettes */}
            {suggestions.palettes && suggestions.palettes.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Palettes recommandées</div>
                {suggestions.palettes.map((palette, i) => (
                  <div key={i} className={`rounded-xl border p-4 space-y-3 transition-all ${appliedPalette === i ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-700 bg-gray-800/50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white text-sm">{palette.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{palette.description}</div>
                      </div>
                      <button type="button" onClick={() => applyPalette(palette, i)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          appliedPalette === i
                            ? 'bg-indigo-600 text-white border border-indigo-500'
                            : 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                        }`}>
                        {appliedPalette === i ? '✓ Appliquée' : 'Appliquer'}
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(['background', 'primary', 'secondary', 'accent', 'text'] as const).map(key => (
                        <div key={key} className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-lg border border-white/10 shadow-md" style={{ backgroundColor: palette[key] }} />
                          <span className="text-[10px] text-gray-500 capitalize">{key === 'background' ? 'fond' : key === 'text' ? 'texte' : key}</span>
                          <span className="text-[10px] text-gray-600 font-mono">{palette[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Style + Thème recommandés */}
            {(suggestions.suggestedVisualStyle || suggestions.suggestedColorTheme) && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recommandations de design</div>

                {suggestedStyleLabel && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${appliedStyle ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-700 bg-gray-800/50'}`}>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Style visuel</div>
                      <div className="font-semibold text-white text-sm">{suggestedStyleLabel}</div>
                      <div className="text-xs text-gray-400">{allStyles.find(s => s.key === suggestions.suggestedVisualStyle)?.desc}</div>
                    </div>
                    <button type="button" onClick={applyStyle}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        appliedStyle ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                      }`}>
                      {appliedStyle ? '✓ Appliqué' : 'Appliquer'}
                    </button>
                  </div>
                )}

                {suggestedThemeLabel && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${appliedTheme ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-700 bg-gray-800/50'}`}>
                    <div className="flex items-center gap-3">
                      {suggestedThemePreview && <div className="w-8 h-8 rounded-lg border border-gray-600 flex-shrink-0" style={{ backgroundColor: suggestedThemePreview }} />}
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Thème de fond</div>
                        <div className="font-semibold text-white text-sm">{suggestedThemeLabel}</div>
                        <div className="text-xs text-gray-400">{allThemes.find(t => t.key === suggestions.suggestedColorTheme)?.desc}</div>
                      </div>
                    </div>
                    <button type="button" onClick={applyTheme}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        appliedTheme ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-indigo-600/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
                      }`}>
                      {appliedTheme ? '✓ Appliqué' : 'Appliquer'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Typo + Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suggestions.typography && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Typographie conseillée</div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-500 w-14 flex-shrink-0">Titres</span>
                      <span className="text-sm font-semibold text-white">{suggestions.typography.display}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-500 w-14 flex-shrink-0">Corps</span>
                      <span className="text-sm text-gray-300">{suggestions.typography.body}</span>
                    </div>
                  </div>
                </div>
              )}

              {suggestions.stats && suggestions.stats.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Impact estimé</div>
                  <div className="space-y-2">
                    {suggestions.stats.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-base">{s.emoji}</span>
                        <div>
                          <span className="text-sm font-bold text-white">{s.value}</span>
                          <span className="text-xs text-gray-400 ml-1">{s.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sections */}
            {suggestions.sections && suggestions.sections.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sections recommandées</div>
                <ul className="space-y-1.5">
                  {suggestions.sections.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tip */}
            {suggestions.tip && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Conseil expert</div>
                <p className="text-sm text-gray-200">{suggestions.tip}</p>
              </div>
            )}

            {/* Tout accepter */}
            {canApplyAll && (
              <button type="button" onClick={applyAll}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-indigo-500/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tout appliquer — palette + style + thème
              </button>
            )}

            {(appliedPalette !== null || appliedStyle || appliedTheme) && (
              <p className="text-xs text-center text-indigo-400">
                ✓ Suggestions appliquées — vous pouvez les ajuster dans les étapes précédentes
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-white">{label}</label>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}
