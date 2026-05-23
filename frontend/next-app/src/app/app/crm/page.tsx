'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, Loader2, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClientRequests } from '@/hooks/useClientRequests';
import { ClientRequest, RequestStatus } from '@/types/clientRequest';
import { sendPaymentLink } from '@/lib/api';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RequestCard from '@/components/crm/RequestCard';
import RequestDetailModal from '@/components/crm/RequestDetailModal';
import LaunchProjectModal from '@/components/crm/LaunchProjectModal';
import EditRequestModal from '@/components/crm/EditRequestModal';

const TABS: { key: RequestStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all',        label: 'Toutes',      icon: <Users size={13} /> },
  { key: 'pending',    label: 'En attente',  icon: <Clock size={13} /> },
  { key: 'validated',  label: 'Validées',    icon: <CheckCircle size={13} /> },
  { key: 'in_progress',label: 'En cours',    icon: <Loader2 size={13} /> },
  { key: 'completed',  label: 'Terminées',   icon: <CheckCircle size={13} /> },
  { key: 'rejected',   label: 'Rejetées',    icon: <XCircle size={13} /> },
];

export default function CRMPage() {
  const router = useRouter();
  const { requests, loading, error, updateStatus, deleteRequest } = useClientRequests();
  const [tab, setTab]                         = useState<RequestStatus | 'all'>('all');
  const [detailRequest, setDetailRequest]     = useState<ClientRequest | null>(null);
  const [launchRequest, setLaunchRequest]     = useState<ClientRequest | null>(null);
  const [editRequest, setEditRequest]         = useState<ClientRequest | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);

  const handleSendStripe = async (request: ClientRequest, price: number) => {
    if (!request.projectId) return;
    const res = await sendPaymentLink(request.projectId, price);
    if (res.payment_url) window.open(res.payment_url, '_blank');
    await updateDoc(doc(db, 'client_requests', request.id), { status: 'payment_link_sent' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette demande définitivement ?')) return;
    setDeletingId(id);
    await deleteRequest(id);
    setDeletingId(null);
  };

  const filtered = useMemo(() => {
    if (tab === 'all') return requests;
    return requests.filter((r) => r.status === tab);
  }, [requests, tab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length };
    for (const r of requests) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [requests]);

  return (
    <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em', lineHeight: 1 }}>
            CRM — Demandes clients
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 5 }}>
            {loading ? 'Chargement…' : `${requests.length} demande${requests.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <a
          href="/form"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 8,
            background: 'var(--surface2)', color: 'var(--text2)',
            fontSize: 13, fontWeight: 500, border: '1px solid var(--bd-bright)',
            textDecoration: 'none', flexShrink: 0, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-bright)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
        >
          <Plus size={13} /> Voir le formulaire client
        </a>
      </motion.div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 10, fontSize: 13, color: 'var(--error)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 10, overflowX: 'auto' }}>
        {TABS.map((t) => {
          const count = counts[t.key] ?? 0;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? 'white' : 'var(--text2)',
                fontSize: 12, fontWeight: active ? 600 : 400,
                transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'inherit',
                boxShadow: active ? '0 0 14px var(--primary-glow)' : 'none',
              }}
            >
              {t.icon} {t.label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface3)', color: active ? 'white' : 'var(--muted)', padding: '0 5px' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64, color: 'var(--muted)' }}>
          <Loader2 size={22} className="animate-spin" style={{ marginRight: 10 }} />
          Connexion à Firestore…
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center', background: 'var(--surface)', border: '1px dashed var(--bd-bright)', borderRadius: 14 }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface3)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--muted)' }}>
            <Users size={20} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            Aucune demande {tab !== 'all' ? `dans cet onglet` : ''}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 300, lineHeight: 1.6 }}>
            Les formulaires soumis par vos clients apparaîtront ici en temps réel.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {filtered.map((r, i) => (
            <RequestCard
              key={r.id}
              request={r}
              index={i}
              onViewDetails={(req) => setDetailRequest(req)}
              onEdit={(req) => setEditRequest(req)}
              onValidate={(id) => updateStatus(id, 'validated')}
              onReject={(id) => updateStatus(id, 'rejected')}
              onLaunch={(req) => setLaunchRequest(req)}
              onRegenerate={(req) => setLaunchRequest(req)}
              onSendStripe={handleSendStripe}
              onDelete={(id) => handleDelete(id)}
              deleting={deletingId === r.id}
            />
          ))}
        </div>
      )}

      <RequestDetailModal request={detailRequest} onClose={() => setDetailRequest(null)} />
      <EditRequestModal request={editRequest} onClose={() => setEditRequest(null)} onSaved={() => setEditRequest(null)} />
      <LaunchProjectModal request={launchRequest} onClose={() => setLaunchRequest(null)} onLaunched={(id) => router.push(`/project?id=${id}`)} />
    </div>
  );
}
