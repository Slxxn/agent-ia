import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Settings } from 'lucide-react';

export interface CookiesBannerProps {
  privacyUrl?: string;
}

type Consent = { analytics: boolean; marketing: boolean };

const STORAGE_KEY = 'cookies_consent';

export default function CookiesBanner({ privacyUrl = '/confidentialite' }: CookiesBannerProps) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<Consent>({ analytics: false, marketing: false });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setTimeout(() => setVisible(true), 1200);
  }, []);

  const save = (c: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setVisible(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });
  const saveCustom = () => save(consent);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: 'min(560px, calc(100vw - 32px))', background: 'var(--surface)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
          role="dialog"
          aria-label="Gestion des cookies"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Cookie size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Nous utilisons des cookies</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                Pour améliorer votre expérience et analyser notre trafic.{' '}
                <a href={privacyUrl} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>En savoir plus</a>
              </p>
            </div>
            <button onClick={rejectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted)' }} aria-label="Refuser et fermer">
              <X size={16} />
            </button>
          </div>

          {showDetails && (
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { key: 'analytics', label: 'Analytiques', desc: 'Mesure d'audience anonymisée' },
                { key: 'marketing', label: 'Marketing', desc: 'Personnalisation des publicités' },
              ] as const).map(({ key, label, desc }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div
                    onClick={() => setConsent(p => ({ ...p, [key]: !p[key] }))}
                    style={{ width: 36, height: 20, borderRadius: 999, background: consent[key] ? 'var(--primary)' : 'var(--surface2)', border: '1px solid var(--bd)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: 2, left: consent[key] ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={acceptAll} className="btn-primary" style={{ flex: 1, fontSize: 13, padding: '10px 16px', minWidth: 120 }}>
              <Check size={14} /> Tout accepter
            </button>
            <button onClick={rejectAll} style={{ flex: 1, fontSize: 13, padding: '9px 16px', background: 'var(--surface2)', border: '1px solid var(--bd)', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', fontWeight: 600, minWidth: 120 }}>
              Tout refuser
            </button>
            {showDetails ? (
              <button onClick={saveCustom} style={{ flex: 1, fontSize: 13, padding: '9px 16px', background: 'transparent', border: '1px solid var(--bd)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 500, minWidth: 120 }}>
                Enregistrer
              </button>
            ) : (
              <button onClick={() => setShowDetails(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '9px 14px', background: 'transparent', border: '1px solid var(--bd)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', flexShrink: 0 }}>
                <Settings size={12} /> Personnaliser
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
