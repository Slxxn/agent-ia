'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClientRequest } from '@/types/clientRequest';
import { generatePromptFromRequest } from '@/lib/generatePromptFromRequest';
import { createProject, startProject } from '@/lib/api';

interface Props {
  request: ClientRequest | null;
  onClose: () => void;
  onLaunched: (projectId: number) => void;
}

export default function LaunchProjectModal({ request, onClose, onLaunched }: Props) {
  const [name, setName]           = useState(request?.businessName ?? '');
  const [prompt, setPrompt]       = useState(request ? generatePromptFromRequest(request) : '');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Sync when request changes
  if (request && name !== request.businessName && !loading) {
    setName(request.businessName);
    setPrompt(generatePromptFromRequest(request));
  }

  const handleLaunch = async () => {
    if (!request || !name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const project = await createProject(name.trim(), `Projet généré depuis la demande CRM - ${request.sector}`);
      await startProject(project.id, prompt.trim());
      await updateDoc(doc(db, 'client_requests', request.id), { status: 'in_progress' });
      onLaunched(project.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du lancement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {request && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            style={{
              position: 'fixed', inset: 0, zIndex: 70,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 640,
              maxHeight: 'calc(100vh - 64px)',
              background: 'var(--surface)',
              border: '1px solid var(--bd-bright)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  {request.status === 'in_progress' || request.status === 'completed' ? 'Régénérer le projet' : 'Lancer le projet'}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, marginTop: 2 }}>
                  {request.status === 'in_progress' || request.status === 'completed'
                    ? 'Un nouveau projet sera créé depuis ce formulaire.'
                    : "L'agent va générer le site automatiquement depuis cette demande."}
                </p>
              </div>
              <button
                onClick={onClose} disabled={loading}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--bd-bright)', background: 'var(--surface3)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
              {/* Project name */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
                  Nom du projet <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid var(--bd-bright)', background: 'var(--surface2)',
                    color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--bd-bright)'; }}
                />
              </div>

              {/* Prompt */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>
                    Prompt de l'agent (pré-rempli — modifiable)
                  </label>
                  <button
                    onClick={() => setPrompt(generatePromptFromRequest(request))}
                    style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Réinitialiser
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={14}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--primary-border)', background: 'rgba(99,102,241,0.04)',
                    color: 'var(--text)', fontSize: 12, outline: 'none', resize: 'vertical',
                    lineHeight: 1.6, fontFamily: 'monospace',
                  }}
                />
              </div>

              {error && (
                <div style={{ fontSize: 12, color: 'var(--error)', padding: '9px 12px', background: 'var(--error-bg)', border: '1px solid var(--error-border)', borderRadius: 8 }}>
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--bd)', flexShrink: 0 }}>
              <button
                onClick={onClose} disabled={loading}
                style={{ flex: 1, height: 38, borderRadius: 8, border: '1px solid var(--bd-bright)', background: 'var(--surface3)', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Annuler
              </button>
              <button
                onClick={handleLaunch}
                disabled={loading || !name.trim() || !prompt.trim()}
                style={{
                  flex: 2, height: 38, borderRadius: 8, border: 'none',
                  background: loading || !name.trim() ? 'var(--surface3)' : 'var(--primary)',
                  color: loading || !name.trim() ? 'var(--muted)' : 'white',
                  fontSize: 13, fontWeight: 600, cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: 'inherit', boxShadow: !loading && name.trim() ? '0 0 20px var(--primary-glow)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? (
                  <><Loader2 size={13} className="animate-spin" /> Création & démarrage…</>
                ) : request.status === 'in_progress' || request.status === 'completed' ? (
                  <><Rocket size={14} /> Créer & régénérer</>
                ) : (
                  <><Rocket size={14} /> Créer & lancer le projet</>
                )}
              </button>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
