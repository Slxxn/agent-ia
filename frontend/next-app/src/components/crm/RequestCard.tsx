'use client';

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Rocket, Calendar, DollarSign, Tag, RotateCcw, Trash2, Pencil } from 'lucide-react';
import { ClientRequest, RequestStatus } from '@/types/clientRequest';

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:    { label: 'En attente',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  validated:  { label: 'Validé',       color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' },
  in_progress:{ label: 'En cours',     color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  completed:  { label: 'Terminé',      color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)'},
  rejected:   { label: 'Rejeté',       color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
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
  deleting?: boolean;
}

export default function RequestCard({ request, index, onViewDetails, onValidate, onReject, onLaunch, onRegenerate, onEdit, onDelete, deleting }: Props) {
  const [acting, setActing] = useState(false);
  const status = STATUS_CONFIG[request.status];

  const act = async (fn: () => Promise<void>) => {
    setActing(true);
    try { await fn(); } finally { setActing(false); }
  };

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
        gap: 14,
        transition: 'border-color 0.15s',
      }}
      whileHover={{ borderColor: 'var(--bd-bright)' } as any}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Logo */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: 'var(--surface3)', border: '1px solid var(--bd)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {request.logoUrl ? (
            <img src={request.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 18 }}>🏢</span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {request.businessName}
            </h3>
            {/* Sector badge */}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
              background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)',
              textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
            }}>
              {request.sector}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {request.description || 'Aucune description'}
          </p>
        </div>

        {/* Status badge */}
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, flexShrink: 0,
          background: status.bg, color: status.color, border: `1px solid ${status.border}`,
        }}>
          {status.label}
        </span>
      </div>

      {/* Color palette + style */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {(request.colors?.length ? request.colors : [request.primaryColor]).slice(0, 4).map((c, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 99, background: c, border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} title={c} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--muted2)', fontStyle: 'italic' }}>{request.visualStyle.replace(/_/g, ' ')}</span>
      </div>

      {/* Counts + meta */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip icon={<Tag size={10} />} label={`${request.features.length} fonctionnalités`} />
        <Chip icon={<Eye size={10} />} label={`${request.pages.length} pages`} />
        {request.budget && <Chip icon={<DollarSign size={10} />} label={request.budget} />}
        {request.siteGoal && <Chip icon={<Calendar size={10} />} label={request.siteGoal} />}
      </div>

      {/* Date */}
      <div style={{ fontSize: 11, color: 'var(--muted2)' }}>
        Soumis le {request.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--bd)', paddingTop: 14 }}>
        <ActionBtn icon={<Eye size={12} />} label="Détails" onClick={() => onViewDetails(request)} />
        <ActionBtn icon={<Pencil size={12} />} label="Modifier" onClick={() => onEdit(request)} />
        <div style={{ marginLeft: 'auto' }}>
          <ActionBtn
            icon={<Trash2 size={12} />} label={deleting ? '…' : 'Supprimer'} color="#EF4444"
            onClick={() => onDelete(request.id)} disabled={deleting}
          />
        </div>

        {request.status === 'pending' && (
          <>
            <ActionBtn
              icon={<CheckCircle size={12} />} label="Valider" color="#22C55E"
              onClick={() => act(() => onValidate(request.id))} disabled={acting}
            />
            <ActionBtn
              icon={<XCircle size={12} />} label="Rejeter" color="#EF4444"
              onClick={() => act(() => onReject(request.id))} disabled={acting}
            />
          </>
        )}

        {request.status === 'validated' && (
          <ActionBtn
            icon={<Rocket size={12} />} label="Lancer le projet" color="#6366F1"
            onClick={() => onLaunch(request)} disabled={acting}
            primary
          />
        )}

        {(request.status === 'in_progress' || request.status === 'completed') && (
          <ActionBtn
            icon={<RotateCcw size={12} />} label="Régénérer" color="#A78BFA"
            onClick={() => onRegenerate(request)} disabled={acting}
          />
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
    }}>
      {icon} {label}
    </span>
  );
}

function ActionBtn({
  icon, label, onClick, color, disabled, primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 500,
        padding: '5px 10px', borderRadius: 7, cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${primary ? 'var(--primary-border)' : 'var(--bd-bright)'}`,
        background: primary ? 'var(--primary-muted)' : 'var(--surface2)',
        color: color ?? (primary ? 'var(--accent)' : 'var(--text2)'),
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s', fontFamily: 'inherit', flexShrink: 0,
      }}
    >
      {icon} {label}
    </button>
  );
}
