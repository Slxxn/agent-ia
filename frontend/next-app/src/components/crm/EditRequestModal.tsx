'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClientRequest, SECTORS, SITE_GOALS, VISUAL_STYLES, VISUAL_STYLES_3D, VISUAL_STYLES_SCROLLYTELLING, COLOR_THEMES, COLOR_THEMES_3D, COLOR_THEMES_SCROLLYTELLING, PAGE_OPTIONS, BUDGETS } from '@/types/clientRequest';

interface Props {
  request: ClientRequest | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditRequestModal({ request, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<ClientRequest>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (request) setForm({ ...request });
  }, [request]);

  if (!request) return null;

  const set = (key: keyof ClientRequest, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const toggleFeature = (key: string) => {
    const cur = (form.features ?? []) as string[];
    set('features', cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]);
  };

  const togglePage = (key: string) => {
    if (key === 'home') return;
    const cur = (form.pages ?? []) as string[];
    set('pages', cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]);
  };

  const handleSave = async () => {
    if (!request) return;
    setLoading(true);
    setError('');
    try {
      const { id, createdAt, ...data } = form as ClientRequest;
      await updateDoc(doc(db, 'client_requests', request.id), data as Record<string, unknown>);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  const is3d = form.siteType === '3d';
  const isScrollytelling = form.siteType === 'scrollytelling';
  const visualStyles = is3d ? VISUAL_STYLES_3D : isScrollytelling ? VISUAL_STYLES_SCROLLYTELLING : VISUAL_STYLES;
  const colorThemes = is3d ? COLOR_THEMES_3D : isScrollytelling ? COLOR_THEMES_SCROLLYTELLING : COLOR_THEMES;
  const colors = (form.colors as string[] | undefined) ?? [form.primaryColor ?? '#6366f1'];

  return (
    <AnimatePresence>
      {request && (
        <>
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
                width: '100%', maxWidth: 680,
                maxHeight: 'calc(100vh - 48px)',
                background: 'var(--surface)', border: '1px solid var(--bd-bright)',
                borderRadius: 16, display: 'flex', flexDirection: 'column',
                overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Modifier la demande</h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, marginTop: 2 }}>{request.businessName}</p>
                </div>
                <button onClick={onClose} disabled={loading} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--bd-bright)', background: 'var(--surface3)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={13} />
                </button>
              </div>

              {/* Body */}
              <div style={{ overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Business info */}
                <Section title="Informations">
                  <Row label="Nom de l'entreprise">
                    <Input value={form.businessName ?? ''} onChange={v => set('businessName', v)} />
                  </Row>
                  <Row label="Slogan / Tagline">
                    <Input value={form.tagline ?? ''} onChange={v => set('tagline', v)} />
                  </Row>
                  <Row label="Description">
                    <Textarea value={form.description ?? ''} onChange={v => set('description', v)} rows={3} />
                  </Row>
                  <Row label="Secteur">
                    <Select value={form.sector ?? ''} onChange={v => set('sector', v)}
                      options={SECTORS.map(s => ({ value: s.key, label: `${s.emoji} ${s.label}` }))} />
                  </Row>
                  <Row label="Objectif principal">
                    <Select value={form.siteGoal ?? ''} onChange={v => set('siteGoal', v)}
                      options={SITE_GOALS.map(g => ({ value: g.key, label: g.label }))} />
                  </Row>
                </Section>

                {/* Audience */}
                <Section title="Audience & positionnement">
                  <Row label="Public cible">
                    <Textarea value={form.targetAudience ?? ''} onChange={v => set('targetAudience', v)} rows={2} />
                  </Row>
                  <Row label="Avantage concurrentiel">
                    <Textarea value={form.uniqueValue ?? ''} onChange={v => set('uniqueValue', v)} rows={2} />
                  </Row>
                  <Row label="Concurrents">
                    <Input value={form.competitors ?? ''} onChange={v => set('competitors', v)} />
                  </Row>
                </Section>

                {/* Visual */}
                <Section title="Identité visuelle">
                  <Row label="Couleurs (hex, séparées par virgule)">
                    <Input
                      value={colors.join(', ')}
                      onChange={v => set('colors', v.split(',').map(c => c.trim()).filter(Boolean))}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {colors.map((c, i) => (
                        <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: '1px solid rgba(255,255,255,0.15)' }} title={c} />
                      ))}
                    </div>
                  </Row>
                  <Row label="Style visuel">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {visualStyles.map(s => (
                        <button key={s.key} type="button" onClick={() => set('visualStyle', s.key)}
                          style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${form.visualStyle === s.key ? 'var(--primary)' : 'var(--bd-bright)'}`, background: form.visualStyle === s.key ? 'var(--primary-muted)' : 'var(--surface3)', color: form.visualStyle === s.key ? 'var(--accent)' : 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label="Thème couleur">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {colorThemes.map(t => (
                        <button key={t.key} type="button" onClick={() => set('colorTheme', t.key)}
                          style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${form.colorTheme === t.key ? 'var(--primary)' : 'var(--bd-bright)'}`, background: form.colorTheme === t.key ? 'var(--primary-muted)' : 'var(--surface3)', color: form.colorTheme === t.key ? 'var(--accent)' : 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 3, background: t.preview, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label="Sites d'inspiration">
                    <Input value={form.inspirationSites ?? ''} onChange={v => set('inspirationSites', v)} placeholder="apple.com, linear.app…" />
                  </Row>
                </Section>

                {/* Pages */}
                <Section title="Pages">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PAGE_OPTIONS.map(p => {
                      const active = (form.pages as string[] ?? []).includes(p.key);
                      return (
                        <button key={p.key} type="button" disabled={p.key === 'home'} onClick={() => togglePage(p.key)}
                          style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${active ? 'var(--success)' : 'var(--bd-bright)'}`, background: active ? 'rgba(34,197,94,0.1)' : 'var(--surface3)', color: active ? 'var(--success)' : 'var(--text2)', fontSize: 12, cursor: p.key === 'home' ? 'default' : 'pointer', fontFamily: 'inherit', opacity: p.key === 'home' ? 0.6 : 1 }}>
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {/* Budget & notes */}
                <Section title="Budget & notes">
                  <Row label="Budget">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {BUDGETS.map(b => (
                        <button key={b} type="button" onClick={() => set('budget', b)}
                          style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${form.budget === b ? 'var(--primary)' : 'var(--bd-bright)'}`, background: form.budget === b ? 'var(--primary-muted)' : 'var(--surface3)', color: form.budget === b ? 'var(--accent)' : 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Row label="Notes complémentaires">
                    <Textarea value={form.notes ?? ''} onChange={v => set('notes', v)} rows={3} />
                  </Row>
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
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</h3>
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

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--bd-bright)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--bd-bright)'; }}
    />
  );
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--bd-bright)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--bd-bright)'; }}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--bd-bright)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
      onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = 'var(--primary)'; }}
      onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'var(--bd-bright)'; }}
    >
      <option value="">— Sélectionner —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
