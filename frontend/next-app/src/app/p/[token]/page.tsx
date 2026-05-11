"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:8000/api";

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
  { key: "pending",          label: "Paiement reçu",            desc: "Votre paiement a été confirmé. Notre équipe prend en charge votre projet.", color: "#6366F1" },
  { key: "validated",        label: "Projet validé",             desc: "Votre projet a été analysé et validé. La génération va démarrer.", color: "#8B5CF6" },
  { key: "in_progress",      label: "Site en cours de création", desc: "L'agent IA génère votre site. Suivez la progression en temps réel.", color: "#F59E0B" },
  { key: "completed",        label: "Site livré !",              desc: "Votre site est prêt. Vous pouvez le consulter dès maintenant.", color: "#10B981" },
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
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: done || isActive ? `${stage.color}22` : "rgba(255,255,255,0.04)",
              border: `2px solid ${done || isActive ? stage.color : "rgba(255,255,255,0.1)"}`,
              transition: "all 0.3s", position: "relative", zIndex: 1,
            }}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3.5 3.5L11 4" stroke={stage.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : isActive ? (
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: stage.color, boxShadow: `0 0 8px ${stage.color}` }} />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
              )}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isPending ? "rgba(226,226,234,0.3)" : isActive ? "#fff" : "rgba(226,226,234,0.7)", marginBottom: 3 }}>
                {stage.label}
              </div>
              {isActive && (
                <div style={{ fontSize: 12, color: "rgba(226,226,234,0.5)", lineHeight: 1.6, maxWidth: 320 }}>
                  {stage.desc}
                </div>
              )}
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

export default function PortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const sessionId = searchParams?.get("session_id");

  const [order, setOrder] = useState<PortalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const verified = useRef(false);

  // Verify Stripe session once on arrival
  useEffect(() => {
    if (!sessionId || verified.current) return;
    verified.current = true;
    fetch(`${API_BASE}/checkout/verify/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.paid) setPaymentVerified(true);
        else setPaymentFailed(true);
      })
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/portal/${token}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error();
        setOrder(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const stage = order
    ? STAGES.find(s => s.key === order.status) ?? STAGES[0]
    : STAGES[0];
  const isAwaitingPayment = order?.status === "awaiting_payment";
  const isLive = order?.status === "completed" && order?.deploy_url;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", color: "#E2E2EA", fontFamily: "inherit", display: "flex", flexDirection: "column" }}>

      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366F1, #818CF8)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <circle cx="7" cy="7" r="1.8" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Builderz</span>
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
            <a href="/" style={{ display: "inline-block", marginTop: 24, padding: "10px 20px", borderRadius: 9, background: "#6366F1", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Retour à l'accueil
            </a>
          </div>
        ) : order && (
          <>
            {/* Payment confirmed toast */}
            {paymentVerified && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", marginBottom: 28 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#10B981" strokeWidth="1.5"/><path d="M5.5 9l2.5 2.5L12.5 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>Paiement confirmé — merci !</span>
              </div>
            )}

            {/* Payment failed warning */}
            {paymentFailed && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 28 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>Le paiement n'a pas été confirmé. Contactez-nous si vous avez été débité.</span>
              </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              {!isAwaitingPayment && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: `${stage.color}18`, border: `1px solid ${stage.color}40`, marginBottom: 16 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: stage.color, boxShadow: `0 0 6px ${stage.color}` }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: stage.color }}>{stage.label}</span>
                </div>
              )}
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6 }}>
                {order.business_name}
              </h1>
              <div style={{ fontSize: 13, color: "rgba(226,226,234,0.45)" }}>
                {SITE_TYPE_LABELS[order.site_type] ?? order.site_type} · Commande du {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>

            {/* Awaiting payment state */}
            {isAwaitingPayment ? (
              <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 16, padding: "28px 26px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>⏳</div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>Paiement en attente</h2>
                <p style={{ fontSize: 13, color: "rgba(226,226,234,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
                  Votre commande est enregistrée mais le paiement n'a pas encore été reçu.<br/>
                  Si vous avez été redirigé ici sans payer, utilisez le bouton ci-dessous.
                </p>
                <a href="/form" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 9, background: "#F59E0B", color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  Reprendre la commande
                </a>
              </div>
            ) : (
              <>
                {/* Progress if in_progress */}
                {order.status === "in_progress" && order.project_progress !== undefined && (
                  <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
                    <ProgressBar progress={order.project_progress} color="#F59E0B" />
                  </div>
                )}

                {/* Deploy link if done */}
                {isLive && (
                  <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#10B981", marginBottom: 10 }}>Votre site est en ligne</div>
                    <a href={order.deploy_url} target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#10B981", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      Visiter mon site
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                )}

                {/* Timeline */}
                <div style={{ background: "rgba(19,19,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 26px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(226,226,234,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 22 }}>
                    Suivi de votre commande
                  </div>
                  <StatusTimeline current={order.status} />
                </div>
              </>
            )}

            <div style={{ marginTop: 24, padding: "14px 18px", borderRadius: 10, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", fontSize: 12, color: "rgba(226,226,234,0.45)", lineHeight: 1.6 }}>
              Conservez ce lien pour suivre l'avancement de votre site. La page se met à jour automatiquement.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
