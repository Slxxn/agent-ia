'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Circle, Mail, Phone } from 'lucide-react';
import { ClientRequest, RequestStatus } from '@/types/clientRequest';

const STATUS_TIMELINE: { status: RequestStatus; label: string }[] = [
  { status: 'pending',     label: 'Soumis' },
  { status: 'validated',   label: 'Validé' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'completed',   label: 'Terminé' },
];
const STATUS_ORDER: RequestStatus[] = ['pending', 'validated', 'in_progress', 'completed'];

// Statuts qui comptent comme "validé" dans la timeline
const STATUS_AS_VALIDATED = new Set(['payment_link_sent']);

const SITE_TYPE_LABEL: Record<string, string> = {
  standard:        'Site Vitrine',
  vitrine_complet: 'Site Vitrine',
  ecommerce:       'E-commerce',
  '3d':            'Expérience 3D',
  scrollytelling:  'Scrollytelling',
};

interface Props {
  request: ClientRequest | null;
  onClose: () => void;
}

export default function RequestDetailModal({ request, onClose }: Props) {
  if (!request) return null;
  const effectiveStatus = STATUS_AS_VALIDATED.has(request.status) ? 'validated' : request.status;
  const currentStep = STATUS_ORDER.indexOf(effectiveStatus as RequestStatus);
  const price = request.suggestedPrice || (request.budget ? parseFloat(request.budget) : null);

  return (
    <AnimatePresence>
      {request && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
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
              width: '100%', maxWidth: 640, maxHeight: 'calc(100vh - 64px)',
              background: 'var(--surface)', border: '1px solid var(--bd-bright)',
              borderRadius: 16, display: 'flex', flexDirection: 'column',
              overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{request.businessName}</h2>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0' }}>
                  {SITE_TYPE_LABEL[request.siteType] || request.siteType} · {request.sector}
                </p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--bd-bright)', background: 'var(--surface3)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Status timeline */}
              {request.status !== 'rejected' && (
                <Section title="Statut">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {STATUS_TIMELINE.map((step, i) => {
                      const done = currentStep >= i;
                      const active = currentStep === i;
                      return (
                        <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_TIMELINE.length - 1 ? 1 : 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 26, height: 26, borderRadius: 99,
                              background: done ? 'var(--primary)' : 'var(--surface3)',
                              border: `2px solid ${done ? 'var(--primary)' : 'var(--bd-bright)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: active ? '0 0 12px var(--primary-glow)' : 'none',
                            }}>
                              {done ? <CheckCircle size={13} color="white" /> : <Circle size={13} color="var(--muted2)" />}
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

              {/* Contact client */}
              {(request.clientEmail || request.clientPhone) && (
                <Section title="Contact client">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {request.clientEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={13} color="var(--muted)" />
                        <a href={`mailto:${request.clientEmail}`} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>{request.clientEmail}</a>
                      </div>
                    )}
                    {request.clientPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone size={13} color="var(--muted)" />
                        <a href={`tel:${request.clientPhone}`} style={{ fontSize: 13, color: 'var(--text)', textDecoration: 'none' }}>{request.clientPhone}</a>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Projet */}
              <Section title="Projet">
                <Grid>
                  <Field label="Entreprise" value={request.businessName} />
                  <Field label="Secteur" value={request.sector || '—'} />
                  <Field label="Type de site" value={SITE_TYPE_LABEL[request.siteType] || request.siteType || '—'} />
                  <Field label="Objectif" value={request.siteGoal || '—'} />
                  {price ? <Field label="Devis estimé" value={`${price} €`} /> : null}
                  <Field label="Date" value={request.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                </Grid>
                {request.description && <Field label="Description" value={request.description} />}
              </Section>

              {/* Audience */}
              {(request.targetAudience || request.uniqueValue) && (
                <Section title="Audience & positionnement">
                  {request.targetAudience && <Field label="Public cible" value={request.targetAudience} />}
                  {request.uniqueValue && <Field label="Avantage concurrentiel" value={request.uniqueValue} />}
                </Section>
              )}

              {/* Features */}
              {request.features.length > 0 && (
                <Section title={`Fonctionnalités (${request.features.length})`}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {request.features.map(f => <Tag key={f} label={f} />)}
                  </div>
                </Section>
              )}

              {/* Pages */}
              {request.pages.length > 0 && (
                <Section title={`Pages (${request.pages.length})`}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {request.pages.map(p => <Tag key={p} label={p} color="var(--success)" />)}
                  </div>
                </Section>
              )}

              {/* Notes */}
              {request.notes && (
                <Section title="Notes">
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{request.notes}</p>
                </Section>
              )}

              {/* Références */}
              {request.references && (
                <Section title="Références & inspirations">
                  <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{request.references}</p>
                </Section>
              )}

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
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{value}</p>
    </div>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 9px', borderRadius: 99,
      background: color ? `${color}18` : 'rgba(99,102,241,0.12)',
      color: color ?? '#818CF8',
      border: `1px solid ${color ? `${color}30` : 'rgba(99,102,241,0.25)'}`,
    }}>
      {label}
    </span>
  );
}
