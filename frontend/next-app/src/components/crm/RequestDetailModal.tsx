'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Circle } from 'lucide-react';
import { ClientRequest, RequestStatus, FEATURE_GROUPS, PAGE_OPTIONS } from '@/types/clientRequest';

const STATUS_TIMELINE: { status: RequestStatus; label: string }[] = [
  { status: 'pending',     label: 'Soumis' },
  { status: 'validated',   label: 'Validé' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'completed',   label: 'Terminé' },
];

const STATUS_ORDER: RequestStatus[] = ['pending', 'validated', 'in_progress', 'completed'];

interface Props {
  request: ClientRequest | null;
  onClose: () => void;
}

export default function RequestDetailModal({ request, onClose }: Props) {
  if (!request) return null;
  const currentStep = STATUS_ORDER.indexOf(request.status);

  return (
    <AnimatePresence>
      {request && (
        <>
          {/* Backdrop + centering wrapper */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
          >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: 'calc(100vh - 64px)',
              background: 'var(--surface)',
              border: '1px solid var(--bd-bright)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: '1px solid var(--bd)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {request.logoUrl && (
                  <img src={request.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--bd)' }} />
                )}
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{request.businessName}</h2>
                  <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{request.sector}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--bd-bright)',
                  background: 'var(--surface3)', color: 'var(--muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Status timeline */}
              {request.status !== 'rejected' && (
                <Section title="Statut">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {STATUS_TIMELINE.map((step, i) => {
                      const done = currentStep >= i;
                      const active = currentStep === i;
                      return (
                        <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_TIMELINE.length - 1 ? 1 : 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 99,
                              background: done ? 'var(--primary)' : 'var(--surface3)',
                              border: `2px solid ${done ? 'var(--primary)' : 'var(--bd-bright)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: active ? '0 0 12px var(--primary-glow)' : 'none',
                            }}>
                              {done ? <CheckCircle size={14} color="white" /> : <Circle size={14} color="var(--muted2)" />}
                            </div>
                            <span style={{ fontSize: 10, color: done ? 'var(--text2)' : 'var(--muted2)', fontWeight: done ? 500 : 400, whiteSpace: 'nowrap' }}>
                              {step.label}
                            </span>
                          </div>
                          {i < STATUS_TIMELINE.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: currentStep > i ? 'var(--primary)' : 'var(--bd)', margin: '0 6px', marginBottom: 22 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Business info */}
              <Section title="Informations business">
                <Grid>
                  <Field label="Nom" value={request.businessName} />
                  <Field label="Secteur" value={request.sector} />
                  <Field label="Budget" value={request.budget || '—'} />
                  <Field label="Objectif" value={request.siteGoal || '—'} />
                </Grid>
                {request.description && <Field label="Description" value={request.description} />}
              </Section>

              {/* Visual identity */}
              <Section title="Identité visuelle">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: request.primaryColor, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
                    <span style={{ fontSize: 10, color: 'var(--muted2)' }}>Principale</span>
                    <span style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'monospace' }}>{request.primaryColor}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted2)' }}>Thème : </span>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>{request.colorTheme}</span>
                  </div>
                </div>
                <Grid>
                  <Field label="Style visuel" value={request.visualStyle.replace(/_/g, ' ')} />
                  {request.inspirationSites && <Field label="Sites d'inspiration" value={request.inspirationSites} />}
                </Grid>
              </Section>

              {/* Features */}
              <Section title={`Fonctionnalités demandées (${request.features.length})`}>
                {FEATURE_GROUPS.map((group) => {
                  const selected = group.items.filter((item) => request.features.includes(item.key));
                  if (selected.length === 0) return null;
                  return (
                    <div key={group.label} style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{group.label}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selected.map((item) => <Tag key={item.key} label={item.label} />)}
                      </div>
                    </div>
                  );
                })}
              </Section>

              {/* Pages */}
              <Section title={`Pages demandées (${request.pages.length})`}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PAGE_OPTIONS.filter((p) => request.pages.includes(p.key)).map((p) => (
                    <Tag key={p.key} label={p.label} color="var(--success)" />
                  ))}
                </div>
              </Section>

              {/* Additional info */}
              {(request.targetAudience || request.competitors || request.notes) && (
                <Section title="Informations complémentaires">
                  {request.targetAudience && <Field label="Public cible" value={request.targetAudience} />}
                  {request.competitors && <Field label="Concurrents" value={request.competitors} />}
                  {request.notes && <Field label="Notes" value={request.notes} />}
                </Section>
              )}

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
      <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{title}</h3>
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 99,
      background: color ? `${color}18` : 'rgba(99,102,241,0.12)',
      color: color ?? '#818CF8',
      border: `1px solid ${color ? `${color}30` : 'rgba(99,102,241,0.25)'}`,
    }}>
      {label}
    </span>
  );
}
