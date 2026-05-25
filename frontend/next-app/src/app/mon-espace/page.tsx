'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';

const API = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : '/api';

interface ClientProject {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  deploy_url?: string;
  client_name?: string;
  form_status?: string;
  suggested_price?: number;
  final_price?: number;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; dot: string }> = {
  idle:     { label: 'En attente',     color: '#94a3b8', dot: '#94a3b8' },
  running:  { label: 'En cours',       color: '#6366f1', dot: '#6366f1' },
  paused:   { label: 'En pause',       color: '#f59e0b', dot: '#f59e0b' },
  error:    { label: 'Erreur',         color: '#ef4444', dot: '#ef4444' },
  done:     { label: 'En ligne ✓',     color: '#22c55e', dot: '#22c55e' },
  payment_sent: { label: 'Paiement reçu', color: '#a78bfa', dot: '#a78bfa' },
};

export default function MonEspacePage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [clientEmail, setClientEmail]   = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);
  const [projects, setProjects]         = useState<ClientProject[]>([]);
  const [fetching, setFetching]         = useState(true);
  const [error, setError]               = useState('');
  const [message, setMessage]           = useState('');
  const [sending, setSending]           = useState(false);
  const [sent, setSent]                 = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  // Step 1: resolve identity — token param or Firebase user
  useEffect(() => {
    if (loading) return;

    const token = searchParams.get('token');

    if (token) {
      fetch(`${API}/client/auth?token=${encodeURIComponent(token)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          setClientEmail(data.email);
          // Clean token from URL without page reload
          window.history.replaceState({}, '', '/mon-espace');
        })
        .catch(() => {
          setError('Lien expiré ou invalide. Demandez un nouveau lien à builderz.');
          setFetching(false);
        })
        .finally(() => setTokenChecked(true));
      return;
    }

    // No token — fall back to Firebase auth
    if (!user) { router.replace('/login'); return; }
    if (isAdmin) { router.replace('/app'); return; }
    setClientEmail(user.email || '');
    setTokenChecked(true);
  }, [loading, user, isAdmin, router, searchParams]);

  // Step 2: fetch projects once email is resolved
  useEffect(() => {
    if (!tokenChecked || !clientEmail) return;

    fetch(`${API}/client/me?email=${encodeURIComponent(clientEmail)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        setProjects(data.projects || []);
        if (data.projects?.length > 0) setSelectedProject(data.projects[0].id);
      })
      .catch((status) => {
        if (status === 404) setError('Aucun projet trouvé pour votre adresse email.');
        else setError('Erreur lors du chargement de vos projets.');
      })
      .finally(() => setFetching(false));
  }, [tokenChecked, clientEmail]);

  const handleSend = async () => {
    if (!message.trim() || !selectedProject || !clientEmail) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/client/modification-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: selectedProject, client_email: clientEmail, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError('Erreur lors de l\'envoi, réessayez.');
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = () => {
    if (user) {
      signOut(auth).then(() => router.replace('/login'));
    } else {
      router.replace('/login');
    }
  };

  if (loading || fetching) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const project = projects.find(p => p.id === selectedProject) || projects[0];
  const statusInfo = project ? (STATUS_LABEL[project.status] || STATUS_LABEL.idle) : null;
  const price = project?.final_price || project?.suggested_price;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1e1e2e', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0d0d14' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            {([[3,3,'#6366f1'],[19,3,'#818cf8'],[35,3,'#6366f1'],[3,19,'#818cf8'],[19,19,'#6366f1'],[35,19,'#818cf8'],[3,35,'#6366f1'],[19,35,'#818cf8'],[35,35,'#6366f1']] as [number,number,string][]).map(([x,y,c],i) => (
              <rect key={i} x={x} y={y} width="13" height="13" rx="3" fill={c} />
            ))}
          </svg>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>builderz</span>
          <span style={{ fontSize: 12, color: '#475569', marginLeft: 4 }}>· Mon espace</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>{clientEmail}</span>
          <button
            onClick={handleSignOut}
            style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>

        {error && !project && (
          <div style={{ background: '#1a0f0f', border: '1px solid #ef444440', borderRadius: 12, padding: '20px 24px', color: '#ef4444', fontSize: 14, textAlign: 'center' }}>
            {error}
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
              Vérifiez que vous utilisez le lien reçu dans votre email ou contactez-nous.
            </p>
          </div>
        )}

        {project && (
          <>
            {/* Project card */}
            <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '24px 28px', borderBottom: '1px solid #1e1e2e' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.025em' }}>{project.name}</h1>
                    {project.description && (
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: '6px 0 0', lineHeight: 1.5 }}>{project.description}</p>
                    )}
                  </div>
                  {statusInfo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f0f1a', border: `1px solid ${statusInfo.dot}33`, borderRadius: 20, padding: '5px 12px', flexShrink: 0 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusInfo.dot, boxShadow: `0 0 6px ${statusInfo.dot}` }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: statusInfo.color }}>{statusInfo.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              {project.status !== 'done' && project.progress > 0 && (
                <div style={{ padding: '16px 28px', borderBottom: '1px solid #1e1e2e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Progression</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{project.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: '#1e1e2e', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${project.progress}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )}

              {/* Info rows */}
              <div style={{ padding: '0 28px' }}>
                {project.deploy_url && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1e1e2e' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Votre site</span>
                    <a href={project.deploy_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
                      {project.deploy_url} →
                    </a>
                  </div>
                )}
                {price && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1e1e2e' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Montant</span>
                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{price}€</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>Commande</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{new Date(project.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Modification request */}
            <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 16, padding: '24px 28px' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', margin: '0 0 6px' }}>Demande de modification</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
                Décrivez les modifications souhaitées sur votre site. Nous reviendrons vers vous sous 24h.
              </p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ex : Changer la couleur du bouton principal en vert, ajouter une section témoignages…"
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#0d0d14', border: '1px solid #1e1e2e', borderRadius: 10,
                  color: '#e2e8f0', fontSize: 13, padding: '12px 14px', resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none', lineHeight: 1.6,
                }}
              />
              {sent && (
                <div style={{ fontSize: 13, color: '#22c55e', margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✓ Demande envoyée, nous vous répondrons rapidement.
                </div>
              )}
              {error && !sent && (
                <div style={{ fontSize: 13, color: '#ef4444', margin: '10px 0 0' }}>{error}</div>
              )}
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                style={{
                  marginTop: 12, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: message.trim() && !sending ? 'pointer' : 'not-allowed',
                  background: message.trim() && !sending ? 'linear-gradient(135deg, #6366f1, #818cf8)' : '#1e1e2e',
                  color: message.trim() && !sending ? '#fff' : '#475569',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                {sending ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
