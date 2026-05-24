'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Rocket, DollarSign, Globe, RotateCcw, Trash2, Pencil, CreditCard } from 'lucide-react';
import { ClientRequest, RequestStatus } from '@/types/clientRequest';

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'En attente',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  validated:  { label: 'Validé',       color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' },
  in_progress:{ label: 'En cours',     color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)' },
  completed:  { label: 'Terminé',      color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  rejected:   { label: 'Rejeté',       color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
};

const SITE_TYPE_LABEL: Record<string, string> = {
  standard:      'Vitrine',
  ecommerce:     'E-commerce',
  '3d':          '3D',
  scrollytelling:'Scrollytelling',
};

interface Props {
  request: ClientRequest;
  index: number;
  onViewDetails: (r: ClientRequest) => void;
  onValidate: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onLaunch: (r: ClientRequest) => void;
  onRegenerate: (r: ClientRequest) => void;
  onEdit: (r: ClientRequest) => void;
  onDelete: (id: string) => void;
  onSendStripe: (r: ClientRequest, price: number) => Promise<void>;
  deleting?: boolean;
}

export default function RequestCard({ request, index, onViewDetails, onValidate, onReject, onLaunch, onRegenerate, onEdit, onDelete, onSendStripe, deleting }: Props) {
  const [acting, setActing] = useState(false);
  const [stripePrice, setStripePrice] = useState(request.suggestedPrice || 490);
  const [stripeSent, setStripeSent] = useState(false);
  const status = STATUS_CONFIG[request.status];

  const act = async (fn: () => Promise<void>) => {
    setActing(true);
    try { await fn(); } finally { setActing(false); }
  };

  const price = request.suggestedPrice || (request.budget ? parseFloat(request.budget) : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--bd)',
        borderRadius: 12,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.15s',
      }}
      whileHover={{ borderColor: 'var(--bd-bright)' } as any}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 9, flexShrink: 0,
          background: 'var(--surface3)', border: '1px solid var(--bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {request.logoUrl
            ? <img src={request.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 17 }}>🏢</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
              {request.businessName}
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              background: 'rgba(99,102,241,0.12)', color: '#818CF8',
              border: '1px solid rgba(99,102,241,0.22)', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {SITE_TYPE_LABEL[request.siteType] || request.sector}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {request.description || request.siteGoal || 'Aucune description'}
          </p>
        </div>

        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, flexShrink: 0,
          background: status.bg, color: status.color, border: `1px solid ${status.border}`,
        }}>
          {status.label}
        </span>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {request.sector && (
          <Chip icon={<Globe size={10} />} label={request.sector} />
        )}
        {price ? (
          <Chip icon={<DollarSign size={10} />} label={`${price} €`} />
        ) : null}
        {request.clientEmail && (
          <Chip icon={null} label={request.clientEmail} />
        )}
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: 'var(--muted2)' }}>
        Soumis le {request.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--bd)', paddingTop: 12 }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', gap: 6 }}>
          <ActionBtn icon={<Eye size={12} />} label="Détails" onClick={() => onViewDetails(request)} />
          <ActionBtn icon={<Pencil size={12} />} label="Modifier" onClick={() => onEdit(request)} />
          <div style={{ marginLeft: 'auto' }}>
            <ActionBtn icon={<Trash2 size={12} />} label={deleting ? '…' : 'Supprimer'} color="#EF4444"
              onClick={() => onDelete(request.id)} disabled={deleting} />
          </div>
        </div>

        {/* Row 2: status actions */}
        {request.status === 'pending' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <ActionBtn icon={<CheckCircle size={12} />} label="Valider" color="#22C55E"
              onClick={() => act(() => onValidate(request.id))} disabled={acting} />
            <ActionBtn icon={<XCircle size={12} />} label="Rejeter" color="#EF4444"
              onClick={() => act(() => onReject(request.id))} disabled={acting} />
          </div>
        )}

        {request.status === 'validated' && (
          request.projectId ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="number"
                value={stripePrice}
                onChange={e => setStripePrice(Number(e.target.value))}
                style={{ width: 70, height: 28, padding: '0 8px', borderRadius: 6, border: '1px solid var(--bd-bright)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'inherit', textAlign: 'center' }}
              />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>€</span>
              <ActionBtn
                icon={<CreditCard size={12} />}
                label={stripeSent ? '✓ Envoyé' : '💳 Lien Stripe'}
                color={stripeSent ? '#10B981' : '#6366F1'}
                disabled={acting || stripeSent}
                onClick={() => act(async () => { await onSendStripe(request, stripePrice); setStripeSent(true); })}
                primary
              />
            </div>
          ) : (
            <div style={{ display: 'flex' }}>
              <ActionBtn icon={<Rocket size={12} />} label="Lancer le projet" color="#6366F1"
                onClick={() => onLaunch(request)} disabled={acting} primary />
            </div>
          )
        )}

        {(request.status === 'in_progress' || request.status === 'completed') && (
          <div style={{ display: 'flex' }}>
            <ActionBtn icon={<RotateCcw size={12} />} label="Régénérer" color="#A78BFA"
              onClick={() => onRegenerate(request)} disabled={acting} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, color: 'var(--muted)', background: 'var(--surface2)',
      border: '1px solid var(--bd)', borderRadius: 99, padding: '2px 8px',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180,
    }}>
      {icon} {label}
    </span>
  );
}

function ActionBtn({ icon, label, onClick, color, disabled, primary }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  color?: string; disabled?: boolean; primary?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 500, padding: '5px 10px', borderRadius: 7,
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: `1px solid ${primary ? 'var(--primary-border)' : 'var(--bd-bright)'}`,
      background: primary ? 'var(--primary-muted)' : 'var(--surface2)',
      color: color ?? (primary ? 'var(--accent)' : 'var(--text2)'),
      opacity: disabled ? 0.5 : 1, transition: 'all 0.15s',
      fontFamily: 'inherit', flexShrink: 0,
    }}>
      {icon} {label}
    </button>
  );
}
