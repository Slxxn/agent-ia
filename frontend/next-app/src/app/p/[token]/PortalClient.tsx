"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8000/api";

interface GuardianSite { id: string; client_name: string; }
interface GuardianRequest {
  id: string; message: string; status: string; admin_response: string; created_at: string;
}

const ACTIONS = [
  { label: "Modifier un texte", desc: "Titre, description, horaires, tarifs…" },
  { label: "Changer une photo", desc: "Ajouter ou remplacer une image" },
  { label: "Mettre à jour mes infos", desc: "Adresse, téléphone, email…" },
  { label: "Autre demande", desc: "Ajout d'une section, couleurs…" },
];

const REQUEST_STATUS: Record<string, { icon: string; label: string; color: string }> = {
  pending:  { icon: "⏳", label: "En attente",  color: "#F59E0B" },
  approved: { icon: "✓",  label: "Validée",     color: "#6366F1" },
  done:     { icon: "✅", label: "Appliquée",   color: "#10B981" },
  rejected: { icon: "✕",  label: "Refusée",     color: "#EF4444" },
};

interface PortalOrder {
  token: string;
  business_name: string;
  site_type: string;
  status: string;
  created_at: string;
  project_status?: string;
  project_progress?: number;
  deploy_url?: string;
}

type Stage = { key: string; label: string; desc: string; color: string };

const STAGES: Stage[] = [
  { key: "pending",     label: "Paiement reçu",            desc: "Votre paiement a été confirmé. Notre équipe prend en charge votre projet.", color: "#6366F1" },
  { key: "validated",   label: "Projet validé",             desc: "Votre projet a été analysé et validé. La génération va démarrer.", color: "#8B5CF6" },
  { key: "in_progress", label: "Site en cours de création", desc: "L'agent IA génère votre site. Suivez la progression en temps réel.", color: "#F59E0B" },
  { key: "completed",   label: "Site livré !",              desc: "Votre site est prêt. Vous pouvez le consulter dès maintenant.", color: "#10B981" },
];

const SITE_TYPE_LABELS: Record<string, string> = {
  standard: "Site Vitrine",
  "3d": "Site 3D / WebGL",
  scrollytelling: "Scrollytelling",
};

function StatusTimeline({ current }: { current: string }) {
  const idx = STAGES.findIndex(s => s.key === current);
  const active = idx >= 0 ? idx : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
      {STAGES.map((stage, i) => {
        const done = i < active;
        const isActive = i === active;
        const isPending = i > active;
        return (
          <div key={stage.key} style={{ display: "flex", gap: 16, paddingBottom: i < STAGES.length - 1 ? 28 : 0, position: "relative" }}>
            {i < STAGES.length - 1 && (
              <div style={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, background: done ? stage.color : "rgba(255,255,255,0.08)", transition: "background 0.4s" }} />
            )}
            <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done || isActive ? `${stage.color}22` : "rgba(255,255,255,0.04)", border: `2px solid ${done || isActive ? stage.color : "rgba(255,255,255,0.1)"}`, transition: "all 0.3s", position: "relative", zIndex: 1 }}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5L11 4" stroke={stage.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : isActive ? (
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: stage.color, boxShadow: `0 0 8px ${stage.color}` }} />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
              )}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isPending ? "rgba(226,226,234,0.3)" : isActive ? "#fff" : "rgba(226,226,234,0.7)", marginBottom: 3 }}>{stage.label}</div>
              {isActive && <div style={{ fontSize: 12, color: "rgba(226,226,234,0.5)", lineHeight: 1.6, maxWidth: 320 }}>{stage.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(226,226,234,0.5)", marginBottom: 8 }}>
        <span>Progression</span>
        <span style={{ color, fontWeight: 700 }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: color, borderRadius: 99, transition: "width 1s ease", boxShadow: `0 0 12px ${color}88` }} />
      </div>
    </div>
  );
}

export default function PortalClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");

  // In static export, useParams returns "_" (catch-all filename) — read real token from URL
  const rawToken = params?.token as string;
  const [token, setToken] = useState<string>(rawToken ?? "");
  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const idx = parts.lastIndexOf("p");
    const urlToken = idx >= 0 ? parts[idx + 1] : "";
    if (urlToken && urlToken !== "_") setToken(urlToken);
    else if (rawToken && rawToken !== "_") setToken(rawToken);
  }, [rawToken]);

  const [order, setOrder] = useState<PortalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const verified = useRef(false);

  // Guardian state
  const [guardianSite, setGuardianSite] = useState<GuardianSite | null>(null);
  const [guardianRequests, setGuardianRequests] = useState<GuardianRequest[]>([]);
  const [requestText, setRequestText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadGuardian = useCallback(async (tok: string) => {
    try {
      const site = await fetch(`${API_BASE}/guardian/portal/${tok}`).then(r => r.ok ? r.json() : null);
      if (!site) return;
      setGuardianSite(site);
      const reqs = await fetch(`${API_BASE}/guardian/sites/${site.id}/requests`).then(r => r.ok ? r.json() : []);
      setGuardianRequests(reqs);
    } catch {}
  }, []);

  const submitRequest = async () => {
    if (!guardianSite || !requestText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_BASE}/guardian/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: guardianSite.id, message: requestText.trim() }),
      });
      setRequestText("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      await loadGuardian(token);
    } finally { setSubmitting(false); }
  };

  useEffect(() => {
    if (!sessionId || verified.current) return;
    verified.current = true;
    fetch(`${API_BASE}/checkout/verify/${sessionId}`)
      .then(r => r.json())
      .then(data => { if (data.paid) setPaymentVerified(true); else setPaymentFailed(true); })
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (!token || token === "_") return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/portal/${token}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error();
        setOrder(await res.json());
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    load().then(() => loadGuardian(token));
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const stage = order ? STAGES.find(s => s.key === order.status) ?? STAGES[0] : STAGES[0];
  const isAwaitingPayment = order?.status === "awaiting_payment";
  const isLive = order?.status === "completed" && order?.deploy_url;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", color: "#E2E2EA", fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            {([[3,3,"#6366f1"],[19,3,"#818cf8"],[35,3,"#6366f1"],[3,19,"#818cf8"],[19,19,"#6366f1"],[35,19,"#818cf8"],[3,35,"#6366f1"],[19,35,"#818cf8"],[35,35,"#6366f1"]] as [number,number,string][]).map(([x,y,c],i) => (
              <rect key={i} x={x} y={y} width="13" height="13" rx="3" fill={c} />
            ))}
          </svg>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "-0.01em" }}>builderz</span>
        </a>
      </nav>

      <div style={{ flex: 1, maxWidth: 680, margin: "0 auto", width: "100%", padding: "48px 24px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notFound ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Commande introuvable</h1>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.5)" }}>Ce lien ne correspond à aucune commande.</p>
            <a href="/" style={{ display: "inline-block", marginTop: 24, padding: "10px 20px", borderRadius: 9, background: "#6366F1", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Retour à l'accueil</a>
          </div>
        ) : order && (
          <>
            {paymentVerified && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", marginBottom: 28 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#10B981" strokeWidth="1.5"/><path d="M5.5 9l2.5 2.5L12.5 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>Paiement confirmé — merci !</span>
              </div>
            )}
            {paymentFailed && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 28 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Le paiement n'a pas été confirmé. Contactez-nous si vous avez été débité.</span>
              </div>
            )}

            <div style={{ marginBottom: 36 }}>
              {!isAwaitingPayment && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: `${stage.color}18`, border: `1px solid ${stage.color}40`, marginBottom: 16 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: stage.color, boxShadow: `0 0 6px ${stage.color}` }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: stage.color }}>{stage.label}</span>
                </div>
              )}
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6 }}>{order.business_name}</h1>
              <div style={{ fontSize: 13, color: "rgba(226,226,234,0.45)" }}>
                {SITE_TYPE_LABELS[order.site_type] ?? order.site_type} · Commande du {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>

            {isAwaitingPayment ? (
              <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 16, padding: "28px 26px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>⏳</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>Paiement en attente</h2>
                <p style={{ fontSize: 13, color: "rgba(226,226,234,0.5)", marginBottom: 20, lineHeight: 1.6 }}>Votre commande est enregistrée mais le paiement n'a pas encore été reçu.</p>
                <a href="/form" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 9, background: "#F59E0B", color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Reprendre la commande</a>
              </div>
            ) : (
              <>
                {order.status === "in_progress" && order.project_progress !== undefined && (
                  <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
                    <ProgressBar progress={order.project_progress} color="#F59E0B" />
                  </div>
                )}
                {isLive && (
                  <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#10B981", marginBottom: 10 }}>Votre site est en ligne</div>
                    <a href={order.deploy_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#10B981", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      Visiter mon site
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                )}
                <div style={{ background: "rgba(19,19,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 26px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(226,226,234,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 22 }}>Suivi de votre commande</div>
                  <StatusTimeline current={order.status} />
                </div>
              </>
            )}

            <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 10, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", fontSize: 12, color: "rgba(226,226,234,0.45)", lineHeight: 1.6 }}>
              Conservez ce lien pour suivre l'avancement de votre site. La page se met à jour automatiquement.
            </div>

            {/* Guardian — section demandes de modification */}
            {guardianSite && (
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(226,226,234,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                  Demander une modification
                </div>

                {/* Action buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {ACTIONS.map(a => (
                    <button key={a.label} onClick={() => setRequestText(prev => prev ? prev : a.label + " : ")}
                      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(19,19,28,0.8)", color: "#E2E2EA", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(226,226,234,0.4)" }}>{a.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Textarea + submit */}
                <textarea
                  value={requestText}
                  onChange={e => setRequestText(e.target.value)}
                  placeholder="Décrivez votre demande en détail…"
                  rows={4}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(19,19,28,0.9)", color: "#E2E2EA", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }}
                />

                {submitted ? (
                  <div style={{ marginTop: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", fontSize: 13, fontWeight: 600, color: "#10B981", textAlign: "center" }}>
                    ✓ Votre demande a été envoyée. Nous vous répondons sous 24h.
                  </div>
                ) : (
                  <button onClick={submitRequest} disabled={submitting || !requestText.trim()}
                    style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 10, background: requestText.trim() ? "#6366F1" : "rgba(99,102,241,0.2)", color: requestText.trim() ? "#fff" : "rgba(226,226,234,0.3)", border: "none", fontSize: 13, fontWeight: 600, cursor: requestText.trim() ? "pointer" : "default", transition: "all 0.15s" }}>
                    {submitting ? "Envoi en cours…" : "Soumettre ma demande →"}
                  </button>
                )}

                {/* Historique des demandes */}
                {guardianRequests.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(226,226,234,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                      Mes demandes
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {guardianRequests.map(req => {
                        const s = REQUEST_STATUS[req.status] ?? REQUEST_STATUS.pending;
                        return (
                          <div key={req.id} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(19,19,28,0.6)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: 12, color: "rgba(226,226,234,0.5)" }}>
                                {new Date(req.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.icon} {s.label}</span>
                            </div>
                            <p style={{ fontSize: 13, color: "#E2E2EA", margin: 0, lineHeight: 1.5 }}>{req.message}</p>
                            {req.admin_response && (
                              <p style={{ fontSize: 12, color: "rgba(226,226,234,0.5)", marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "6px 0 0" }}>
                                Notre réponse : {req.admin_response}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
