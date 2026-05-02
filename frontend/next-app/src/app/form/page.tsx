'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  SITE_GOALS,
  SECTORS,
  COLOR_THEMES,
  VISUAL_STYLES,
  FEATURE_GROUPS,
  PAGE_OPTIONS,
  BUDGETS,
} from '@/types/clientRequest';

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  // Step 1 — Projet
  businessName: string;
  sector: string;
  siteGoal: string;
  tagline: string;
  description: string;
  // Step 2 — Histoire
  targetAudience: string;
  uniqueValue: string;
  competitors: string;
  // Step 3 — Visuel
  logoFile: File | null;
  colors: string[];
  colorTheme: string;
  visualStyle: string;
  inspirationSites: string;
  // Step 4 — Site
  pages: string[];
  features: string[];
  // Step 5 — Finir
  budget: string;
  notes: string;
}

const INITIAL: FormData = {
  businessName: '', sector: '', siteGoal: '', tagline: '', description: '',
  targetAudience: '', uniqueValue: '', competitors: '',
  logoFile: null, colors: ['#6366f1'], colorTheme: 'light', visualStyle: '', inspirationSites: '',
  pages: ['home'], features: [],
  budget: '', notes: '',
};

const STEPS = [
  { id: 1, label: 'Projet',   short: '1' },
  { id: 2, label: 'Histoire', short: '2' },
  { id: 3, label: 'Visuel',   short: '3' },
  { id: 4, label: 'Site',     short: '4' },
  { id: 5, label: 'Finir',    short: '5' },
];

export default function FormPage() {
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
    if (step === 4) return form.pages.length > 0;
    return !!form.budget;
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

      await addDoc(collection(db, 'client_requests'), {
        status: 'pending',
        createdAt: serverTimestamp(),
        businessName: form.businessName,
        sector: form.sector,
        siteGoal: form.siteGoal,
        tagline: form.tagline,
        description: form.description,
        targetAudience: form.targetAudience,
        uniqueValue: form.uniqueValue,
        competitors: form.competitors,
        logoUrl,
        colors: form.colors,
        colorTheme: form.colorTheme,
        visualStyle: form.visualStyle,
        inspirationSites: form.inspirationSites,
        pages: form.pages,
        features: form.features,
        budget: form.budget,
        notes: form.notes,
      });

      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
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
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Créez votre site web</h1>
          <p className="text-gray-400">Décrivez votre projet, notre IA s&apos;occupe du reste.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > s.id ? 'bg-indigo-600 text-white' :
                step === s.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30' :
                'bg-gray-800 text-gray-500'
              }`}>
                {step > s.id ? <CheckIcon /> : s.short}
              </div>
              <span className={`hidden sm:block text-sm font-medium transition-colors ${
                step >= s.id ? 'text-white' : 'text-gray-600'
              }`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 transition-colors ${step > s.id ? 'bg-indigo-600' : 'bg-gray-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && <Step2 form={form} set={set} />}
            {step === 3 && (
              <Step3
                form={form} set={set}
                logoPreview={logoPreview}
                fileRef={fileRef}
                dragRef={dragRef}
                handleLogoFile={handleLogoFile}
              />
            )}
            {step === 4 && <Step4 form={form} toggleArr={toggleArr} />}
            {step === 5 && <Step5 form={form} set={set} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
            >
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
              {submitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Projet ───────────────────────────────────────────────────────────
function Step1({ form, set }: { form: FormData; set: (f: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Votre projet</h2>
        <p className="text-gray-400 text-sm">Les bases de votre future présence en ligne.</p>
      </div>

      <Field label="Nom de votre entreprise *">
        <input
          type="text"
          placeholder="Ex: Studio Lumière, Café des Arts…"
          value={form.businessName}
          onChange={e => set('businessName', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </Field>

      <Field label="Secteur d'activité *">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SECTORS.map(s => (
            <button
              key={s.key}
              type="button"
              onClick={() => set('sector', s.key)}
              className={`p-3 rounded-xl border text-center transition-all ${
                form.sector === s.key
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="text-xs font-medium leading-tight">{s.label}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Objectif principal du site *">
        <div className="space-y-2">
          {SITE_GOALS.map(g => (
            <button
              key={g.key}
              type="button"
              onClick={() => set('siteGoal', g.key)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                form.siteGoal === g.key
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-white">{g.label}</div>
              <div className="text-sm text-gray-400">{g.desc}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Accroche / Slogan" hint="La phrase qui résume votre valeur en une ligne">
        <input
          type="text"
          placeholder="Ex: L'artisanat au service de votre intérieur"
          value={form.tagline}
          onChange={e => set('tagline', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </Field>

      <Field label="Description de votre activité" hint="Que faites-vous concrètement ? Pour qui ? (2–4 phrases)">
        <textarea
          rows={4}
          placeholder="Décrivez votre activité, vos produits ou services, et ce qui vous rend unique…"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>
    </div>
  );
}

// ─── Step 2: Histoire ─────────────────────────────────────────────────────────
function Step2({ form, set }: { form: FormData; set: (f: keyof FormData, v: unknown) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Votre audience & positionnement</h2>
        <p className="text-gray-400 text-sm">Ces informations permettent à l&apos;IA de créer du contenu ciblé et percutant.</p>
      </div>

      <Field label="Qui sont vos clients idéaux ? *" hint="Âge, profil, besoins, situation…">
        <textarea
          rows={3}
          placeholder="Ex: Femmes de 25–45 ans cherchant des soins bien-être haut de gamme, professionnelles actives…"
          value={form.targetAudience}
          onChange={e => set('targetAudience', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>

      <Field label="Votre avantage concurrentiel *" hint="Pourquoi un client devrait vous choisir plutôt qu'un concurrent ?">
        <textarea
          rows={3}
          placeholder="Ex: Seule boutique zéro-déchet de la ville, livraison en 2h, formules sur-mesure, 15 ans d'expérience…"
          value={form.uniqueValue}
          onChange={e => set('uniqueValue', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>

      <Field label="Vos concurrents" hint="Sites ou marques dont vous vous inspirez ou que vous souhaitez dépasser">
        <textarea
          rows={2}
          placeholder="Ex: nomconcurrent.fr, autresite.com — ce que vous aimez / n'aimez pas chez eux"
          value={form.competitors}
          onChange={e => set('competitors', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>
    </div>
  );
}

// ─── Step 3: Visuel ───────────────────────────────────────────────────────────
function Step3({
  form, set, logoPreview, fileRef, dragRef, handleLogoFile,
}: {
  form: FormData;
  set: (f: keyof FormData, v: unknown) => void;
  logoPreview: string | null;
  fileRef: React.RefObject<HTMLInputElement>;
  dragRef: React.RefObject<HTMLDivElement>;
  handleLogoFile: (f: File) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Identité visuelle</h2>
        <p className="text-gray-400 text-sm">L&apos;apparence et l&apos;ambiance de votre site.</p>
      </div>

      {/* Logo upload */}
      <Field label="Logo" hint="PNG ou SVG recommandé — fond transparent idéal">
        <div
          ref={dragRef}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) handleLogoFile(file);
          }}
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
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleLogoFile(file);
          }}
        />
      </Field>

      {/* Colors */}
      <Field label="Couleurs de votre marque" hint={`Jusqu'à 4 couleurs — la première est la couleur principale`}>
        <div className="flex flex-wrap gap-3">
          {form.colors.map((color, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={e => {
                    const next = [...form.colors];
                    next[i] = e.target.value;
                    set('colors', next);
                  }}
                  className="w-14 h-14 rounded-xl border-2 border-gray-700 cursor-pointer bg-transparent"
                />
                {form.colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => set('colors', form.colors.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-red-600 rounded-full text-white text-xs flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">{color}</span>
              {i === 0 && <span className="text-xs text-indigo-400">principale</span>}
            </div>
          ))}
          {form.colors.length < 4 && (
            <button
              type="button"
              onClick={() => set('colors', [...form.colors, '#ffffff'])}
              className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-600 hover:border-indigo-500 flex items-center justify-center text-gray-500 hover:text-indigo-400 transition-colors text-2xl"
            >
              +
            </button>
          )}
        </div>
      </Field>

      {/* Color theme */}
      <Field label="Thème général *">
        <div className="grid grid-cols-3 gap-3">
          {COLOR_THEMES.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => set('colorTheme', t.key)}
              className={`p-4 rounded-xl border transition-all ${
                form.colorTheme === t.key
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}
            >
              <div
                className="w-full h-8 rounded-lg mb-2 border border-gray-600"
                style={{ backgroundColor: t.preview }}
              />
              <div className="font-medium text-white text-sm">{t.label}</div>
              <div className="text-xs text-gray-400">{t.desc}</div>
            </button>
          ))}
        </div>
      </Field>

      {/* Visual style */}
      <Field label="Style visuel *">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VISUAL_STYLES.map(s => (
            <button
              key={s.key}
              type="button"
              onClick={() => set('visualStyle', s.key)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                form.visualStyle === s.key
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-white text-sm">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Sites d'inspiration" hint="URL de sites que vous aimez (optionnel)">
        <input
          type="text"
          placeholder="Ex: apple.com, notion.so, linear.app"
          value={form.inspirationSites}
          onChange={e => set('inspirationSites', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors"
        />
      </Field>
    </div>
  );
}

// ─── Step 4: Site ─────────────────────────────────────────────────────────────
function Step4({
  form, toggleArr,
}: {
  form: FormData;
  toggleArr: (field: 'pages' | 'features', key: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Structure & fonctionnalités</h2>
        <p className="text-gray-400 text-sm">Quelles pages et quels outils votre site doit-il avoir ?</p>
      </div>

      <Field label="Pages du site *" hint="La page Accueil est toujours incluse">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAGE_OPTIONS.map(p => (
            <button
              key={p.key}
              type="button"
              disabled={p.key === 'home'}
              onClick={() => p.key !== 'home' && toggleArr('pages', p.key)}
              className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                form.pages.includes(p.key)
                  ? 'border-indigo-500 bg-indigo-600/20'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
              } ${p.key === 'home' ? 'opacity-60 cursor-default' : ''}`}
            >
              <div className="font-medium text-white text-sm">{p.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Fonctionnalités" hint="Sélectionnez tout ce dont vous avez besoin">
        <div className="space-y-4">
          {FEATURE_GROUPS.map(group => (
            <div key={group.label}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {group.label}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleArr('features', item.key)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                      form.features.includes(item.key)
                        ? 'border-indigo-500 bg-indigo-600/20 text-white'
                        : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
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

// ─── Gemini Suggestions types ─────────────────────────────────────────────────
interface GeminiStat { emoji: string; value: string; label: string; }
interface GeminiSuggestions {
  palette?: { primary: string; secondary: string; accent: string; background: string; names?: string[] };
  ambiance?: string;
  typography?: { display: string; body: string };
  stats?: GeminiStat[];
  sections?: string[];
  animations?: string;
  tip?: string;
}

// ─── Step 5: Finir ────────────────────────────────────────────────────────────
function Step5({ form, set }: { form: FormData; set: (f: keyof FormData, v: unknown) => void }) {
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState<GeminiSuggestions | null>(null);
  const [geminiError, setGeminiError] = useState('');

  const fetchGemini = async () => {
    setGeminiLoading(true);
    setGeminiError('');
    try {
      const res = await fetch('/api/gemini-preview', {
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
          colors: form.colors,
          colorTheme: form.colorTheme,
          visualStyle: form.visualStyle,
          pages: form.pages,
          features: form.features,
          budget: form.budget,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeminiSuggestions(data.suggestions);
      } else {
        setGeminiError(data.error || 'Erreur inconnue');
      }
    } catch {
      setGeminiError('Impossible de contacter le serveur');
    } finally {
      setGeminiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Derniers détails</h2>
        <p className="text-gray-400 text-sm">Budget et informations complémentaires.</p>
      </div>

      <Field label="Budget *">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUDGETS.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => set('budget', b)}
              className={`px-4 py-3 rounded-xl border font-medium transition-all ${
                form.budget === b
                  ? 'border-indigo-500 bg-indigo-600/20 text-white'
                  : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Notes complémentaires" hint="Délais, contraintes techniques, demandes spéciales…">
        <textarea
          rows={4}
          placeholder="Ex: Livraison souhaitée avant le 15 juin, compatibilité avec mon système de caisse existant, etc."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
        />
      </Field>

      {/* Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2 text-sm">
        <div className="font-semibold text-white mb-3">Récapitulatif</div>
        <Row label="Entreprise" value={form.businessName} />
        <Row label="Secteur" value={SECTORS.find(s => s.key === form.sector)?.label} />
        <Row label="Objectif" value={SITE_GOALS.find(g => g.key === form.siteGoal)?.label} />
        <Row label="Style" value={VISUAL_STYLES.find(s => s.key === form.visualStyle)?.label} />
        <Row label="Pages" value={`${form.pages.length} page(s)`} />
        <Row label="Fonctionnalités" value={`${form.features.length} sélectionnée(s)`} />
        <Row label="Budget" value={form.budget} />
      </div>

      {/* Gemini Suggestions */}
      <div>
        <button
          type="button"
          onClick={fetchGemini}
          disabled={geminiLoading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold border border-indigo-500/60 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 transition-all disabled:opacity-50"
        >
          {geminiLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Suggestions IA pour mon projet
            </>
          )}
        </button>

        {geminiError && (
          <p className="mt-2 text-sm text-red-400 text-center">{geminiError}</p>
        )}

        {geminiSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-5"
          >
            {/* Palette */}
            {geminiSuggestions.palette && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Palette recommandée</div>
                <div className="flex gap-3 flex-wrap">
                  {(['primary', 'secondary', 'accent', 'background'] as const).map((key, i) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg border border-white/10 shadow-md"
                        style={{ backgroundColor: geminiSuggestions.palette![key] }}
                      />
                      <div>
                        <div className="text-xs text-gray-400">{geminiSuggestions.palette!.names?.[i] ?? key}</div>
                        <div className="text-xs text-gray-600 font-mono">{geminiSuggestions.palette![key]}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {geminiSuggestions.ambiance && (
                  <p className="text-sm text-gray-400 italic">{geminiSuggestions.ambiance}</p>
                )}
              </div>
            )}

            {/* Stats */}
            {geminiSuggestions.stats && geminiSuggestions.stats.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Impact estimé</div>
                <div className="grid grid-cols-2 gap-3">
                  {geminiSuggestions.stats.map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-xl mb-1">{s.emoji}</div>
                      <div className="text-lg font-bold text-white">{s.value}</div>
                      <div className="text-xs text-gray-400 leading-tight mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections + Typography */}
            {(geminiSuggestions.sections || geminiSuggestions.typography) && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                {geminiSuggestions.typography && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Typographie</div>
                    <div className="text-sm text-gray-300">
                      <span className="text-white">{geminiSuggestions.typography.display}</span>
                      <span className="text-gray-500"> / </span>
                      <span>{geminiSuggestions.typography.body}</span>
                    </div>
                  </div>
                )}
                {geminiSuggestions.sections && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sections recommandées</div>
                    <ul className="space-y-1">
                      {geminiSuggestions.sections.map((s, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">›</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tip */}
            {geminiSuggestions.tip && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Conseil expert</div>
                <p className="text-sm text-gray-200">{geminiSuggestions.tip}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
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
