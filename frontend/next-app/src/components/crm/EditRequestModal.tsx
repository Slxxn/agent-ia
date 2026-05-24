'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClientRequest, SECTORS, SITE_GOALS } from '@/types/clientRequest';

interface Props {
  request: ClientRequest | null;
  onClose: () => void;
  onSaved: () => void;
}

interface EditForm {
  businessName: string;
  description: string;
  sector: string;
  siteGoal: string;
  targetAudience: string;
  uniqueValue: string;
  clientEmail: string;
  clientPhone: string;
  suggestedPrice: number;
  notes: string;
  references: string;
}

export default function EditRequestModal({ request, onClose, onSaved }: Props) {
  const [form, setForm] = useState<EditForm>({
    businessName: '', description: '', sector: '', siteGoal: '',
    targetAudience: '', uniqueValue: '', clientEmail: '',
    clientPhone: '', suggestedPrice: 0, notes: '', references: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!request) return;
    setError('');
    setForm({
      businessName:   request.businessName || '',
      description:    request.description || '',
      sector:         request.sector || '',
      siteGoal:       request.siteGoal || '',
      targetAudience: request.targetAudience || '',
      uniqueValue:    request.uniqueValue || '',
      clientEmail:    request.clientEmail || '',
      clientPhone:    request.clientPhone || '',
      suggestedPrice: request.suggestedPrice || 0,
      notes:          request.notes || '',
      references:     request.references || '',
    });
  }, [request]);

  if (!request) return null;

  const set = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'client_requests', request.id), {
        businessName:   form.businessName,
        description:    form.description,
        sector:         form.sector,
        siteGoal:       form.siteGoal,
        targetAudience: form.targetAudience,
        uniqueValue:    form.uniqueValue,
        clientEmail:    form.clientEmail,
        clientPhone:    form.clientPhone,
        suggestedPrice: form.suggestedPrice,
        notes:          form.notes,
        references:     form.references,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {request && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => !loading && onClose()}
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 580, maxHeight: 'calc(100vh - 48px)',
              background: 'var(--surface)', border: '1px solid var(--bd-bright)',
              borderRadius: 16, display: 'flex', flexDirection: 'column',
              overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Modifier la demande</h2>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 0' }}>{request.businessName}</p>
              </div>
              <button onClick={onClose} disabled={loading} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--bd-bright)', background: 'var(--surface3)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              <Section title="Contact client">
                <Row label="Email"><Input value={form.clientEmail} onChange={v => set('clientEmail', v)} type="email" /></Row>
                <Row label="Téléphone"><Input value={form.clientPhone} onChange={v => set('clientPhone', v)} type="tel" /></Row>
              </Section>

              <Section title="Projet">
                <Row label="Nom de l'entreprise"><Input value={form.businessName} onChange={v => set('businessName', v)} /></Row>
                <Row label="Description"><Textarea value={form.description} onChange={v => set('description', v)} rows={3} /></Row>
                <Row label="Secteur">
                  <Select value={form.sector} onChange={v => set('sector', v)}
                    options={SECTORS.map(s => ({ value: s.key, label: `${s.emoji} ${s.label}` }))} />
                </Row>
                <Row label="Objectif principal">
                  <Select value={form.siteGoal} onChange={v => set('siteGoal', v)}
                    options={SITE_GOALS.map(g => ({ value: g.key, label: g.label }))} />
                </Row>
                <Row label="Devis estimé (€)">
                  <Input value={String(form.suggestedPrice || '')} onChange={v => set('suggestedPrice', parseFloat(v) || 0)} type="number" />
                </Row>
              </Section>

              <Section title="Compléments">
                <Row label="Public cible"><Textarea value={form.targetAudience} onChange={v => set('targetAudience', v)} rows={2} /></Row>
                <Row label="Avantage concurrentiel"><Textarea value={form.uniqueValue} onChange={v => set('uniqueValue', v)} rows={2} /></Row>
                <Row label="Références & inspirations"><Input value={form.references} onChange={v => set('references', v)} placeholder="apple.com, linear.app…" /></Row>
                <Row label="Notes internes"><Textarea value={form.notes} onChange={v => set('notes', v)} rows={2} /></Row>
              </Section>

              {error && (
                <div style={{ fontSize: 12, color: 'var(--error)', padding: '9px 12px', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 8 }}>
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 8, padding: '14px 22px', borderTop: '1px solid var(--bd)', flexShrink: 0 }}>
              <button onClick={onClose} disabled={loading} style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid var(--bd-bright)', background: 'var(--surface3)', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={loading} style={{ flex: 2, height: 36, borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', boxShadow: '0 0 18px var(--primary-glow)' }}>
                {loading ? <><Loader2 size={13} className="animate-spin" /> Sauvegarde…</> : <><Save size={13} /> Sauvegarder</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 10, padding: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--bd-bright)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--bd-bright)'; }}
    />
  );
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--bd-bright)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--bd-bright)'; }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--bd-bright)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', boxSizing: 'border-box' }}
      onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = 'var(--primary)'; }}
      onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'var(--bd-bright)'; }}
    >
      <option value="">— Sélectionner —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
