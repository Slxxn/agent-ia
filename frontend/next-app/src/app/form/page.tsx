'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormProgress } from '@/components/form/FormProgress';
import { Step1Projet } from '@/components/form/Step1Projet';
import { Step2Activite } from '@/components/form/Step2Activite';
import { Step3Style } from '@/components/form/Step3Style';
import { Step4Finaliser } from '@/components/form/Step4Finaliser';
import { submitForm, type FormSubmitData } from '@/lib/form-submit';

const STEPS = [
  { num: 1, label: 'Votre projet',    time: '1' },
  { num: 2, label: 'Votre activité',  time: '2' },
  { num: 3, label: 'Votre style',     time: '2' },
  { num: 4, label: 'Finaliser',       time: '1' },
];

const INITIAL: Partial<FormSubmitData> = {
  siteType: 'standard',
  colors: ['#6366f1'],
  pages: ['home'],
  features: [],
  generateLogo: false,
};

const STORAGE_KEY = 'builderz_form_v2';

export default function FormPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<FormSubmitData>>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const update = (fields: Partial<FormSubmitData>) =>
    setData(prev => ({ ...prev, ...fields }));

  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, 4)); };
  const back = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitForm(data as FormSubmitData);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setSubmitting(false);
      alert('Une erreur est survenue. Réessayez.');
    }
  };

  const variants = {
    enter: { opacity: 0, x: direction * 30 },
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, x: direction * -30, transition: { duration: 0.2 } },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <header style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>builderz</span>
        </a>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          🔒 Sécurisé · Paiement Stripe
        </span>
      </header>

      {/* Progress */}
      <FormProgress steps={STEPS} current={step} />

      {/* Contenu */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px 80px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {step === 1 && <Step1Projet data={data} update={update} onNext={next} />}
              {step === 2 && <Step2Activite data={data} update={update} onNext={next} onBack={back} />}
              {step === 3 && <Step3Style data={data} update={update} onNext={next} onBack={back} />}
              {step === 4 && (
                <Step4Finaliser
                  data={data}
                  update={update}
                  onBack={back}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
