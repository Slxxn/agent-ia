"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, Check, X, Clock, ExternalLink, AlertTriangle, Zap, Pencil, Save, KeyRound } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

interface GuardianSite {
  id: string;
  client_name: string;
  client_email: string;
  site_url: string;
  plan: string;
  uptime_status: string | null;
  ssl_details: string | null;
  pending_requests: number;
}

interface GuardianRequest {
  id: string;
  site_id: string;
  message: string;
  status: string;
  admin_response: string;
  created_at: string;
  client_name: string;
  site_url: string;
  client_email: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  ok:      { bg: "rgba(16,185,129,0.1)",  color: "#10B981", border: "rgba(16,185,129,0.25)",  label: "En ligne" },
  error:   { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", border: "rgba(239,68,68,0.25)",   label: "Erreur" },
  down:    { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", border: "rgba(239,68,68,0.25)",   label: "Hors ligne" },
  warning: { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", border: "rgba(245,158,11,0.25)",  label: "Avertissement" },
};

const DEFAULT_STATUS = { bg: "rgba(100,116,139,0.1)", color: "#64748B", border: "rgba(100,116,139,0.25)", label: "Non vérifié" };

function UptimeBadge({ status }: { status: string | null }) {
  const s = (status && STATUS_STYLES[status]) ? STATUS_STYLES[status] : DEFAULT_STATUS;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

function SslBadge({ details }: { details: string | null }) {
  if (!details) return <span style={{ fontSize: 11, color: "var(--muted2)" }}>SSL —</span>;
  try {
    const d = JSON.parse(details.replace(/'/g, '"'));
    if (d.status === "ok") return <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981" }}>SSL OK ({d.days_left}j)</span>;
    if (d.status === "warning") return <span style={{ fontSize: 11, fontWeight: 600, color: "#F59E0B" }}>SSL expire dans {d.days_left}j</span>;
    if (d.status === "expired") return <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444" }}>SSL expiré</span>;
  } catch {}
  return <span style={{ fontSize: 11, color: "var(--muted2)" }}>SSL —</span>;
}

export default function GuardianPage() {
  const [sites, setSites] = useState<GuardianSite[]>([]);
  const [requests, setRequests] = useState<GuardianRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<Record<string, string>>({});
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [tokenDraft, setTokenDraft] = useState<Record<string, string>>({});
  const [savingToken, setSavingToken] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([
        fetch(`${API}/guardian/sites`).then(res => res.ok ? res.json() : []),
        fetch(`${API}/guardian/requests`).then(res => res.ok ? res.json() : []),
      ]);
      setSites(s);
      setRequests(r);
      // Load admin tokens for each site
      const tokenMap: Record<string, string> = {};
      await Promise.all((s as GuardianSite[]).map(async (site) => {
        const slug = site.site_url.replace(/^https?:\/\//, "").split(".")[0].toUpperCase();
        const key = `${slug}_ADMIN_TOKEN`;
        const res = await fetch(`${API}/settings/${key}`);
        if (res.ok) { const d = await res.json(); tokenMap[site.id] = d.value || ""; }
        else tokenMap[site.id] = "";
      }));
      setTokens(tokenMap);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runCheck = async (siteId: string) => {
    setChecking(siteId);
    try {
      await fetch(`${API}/guardian/sites/${siteId}/check`, { method: "POST" });
      await load();
    } finally { setChecking(null); }
  };

  const saveEmail = async (siteId: string) => {
    setSavingEmail(siteId);
    try {
      await fetch(`${API}/guardian/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_email: emailDraft[siteId] }),
      });
      await load();
      setEditingEmail(null);
    } finally { setSavingEmail(null); }
  };

  const tokenKey = (siteUrl: string) => {
    const slug = siteUrl.replace(/^https?:\/\//, "").split(".")[0].toUpperCase();
    return `${slug}_ADMIN_TOKEN`;
  };

  const saveToken = async (siteId: string, siteUrl: string) => {
    setSavingToken(siteId);
    try {
      const key = tokenKey(siteUrl);
      await fetch(`${API}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: tokenDraft[siteId] }),
      });
      setTokens(p => ({ ...p, [siteId]: tokenDraft[siteId] }));
      setEditingToken(null);
    } finally { setSavingToken(null); }
  };

  const handleAction = async (reqId: string, action: string) => {
    setActing(reqId);
    try {
      await fetch(`${API}/guardian/requests/${reqId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, admin_response: responses[reqId] || "" }),
      });
      await load();
    } finally { setActing(null); }
  };

  const pending = requests.filter(r => r.status === "pending");
  const history = requests.filter(r => r.status !== "pending");

  return (
    <div style={{ padding: "20px 24px", maxWidth: 900, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
            <Shield size={16} style={{ color: "#10B981" }} /> Site Guardian
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {sites.length} site{sites.length !== 1 ? "s" : ""} · {pending.length} demande{pending.length !== 1 ? "s" : ""} en attente
          </p>
        </div>
      </div>

      {pending.length > 0 && (
        <div style={{ marginBottom: 20, padding: "10px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={14} style={{ color: "#F59E0B", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>
            {pending.length} demande{pending.length !== 1 ? "s" : ""} en attente de validation
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
      ) : (<>

        {/* Pending requests */}
        {pending.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Demandes en attente
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pending.map(req => (
                <div key={req.id} style={{ background: "var(--surface)", border: "1px solid var(--bd-bright)", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{req.client_name}</span>
                        <a href={req.site_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                          <ExternalLink size={10} />{req.site_url.replace(/^https?:\/\//, "").split("/")[0]}
                        </a>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55, margin: 0 }}>{req.message}</p>
                      <span style={{ fontSize: 11, color: "var(--muted2)", marginTop: 5, display: "block" }}>
                        {new Date(req.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      placeholder="Message au client (optionnel)…"
                      value={responses[req.id] || ""}
                      onChange={e => setResponses(p => ({ ...p, [req.id]: e.target.value }))}
                      style={{ flex: 1, minWidth: 160, padding: "7px 11px", borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 12, outline: "none" }}
                    />
                    <button onClick={() => handleAction(req.id, "approve")} disabled={acting === req.id}
                      style={{ padding: "7px 13px", borderRadius: 7, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <Check size={12} /> Valider
                    </button>
                    <button onClick={() => handleAction(req.id, "done")} disabled={acting === req.id}
                      style={{ padding: "7px 13px", borderRadius: 7, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#6366F1", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <Zap size={12} /> Fait
                    </button>
                    <button onClick={() => handleAction(req.id, "reject")} disabled={acting === req.id}
                      style={{ padding: "7px 13px", borderRadius: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <X size={12} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sites grid */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Sites surveillés
          </h2>
          {sites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--bd)" }}>
              <Shield size={28} style={{ color: "var(--muted)", marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: "var(--muted)" }}>Aucun site. Ajoutez des sites via l'API ou le CRM.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
              {sites.map(site => (
                <div key={site.id} style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{site.client_name}</div>
                      <a href={site.site_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                        <ExternalLink size={9} />{site.site_url.replace(/^https?:\/\//, "").split("/")[0]}
                      </a>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(99,102,241,0.1)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.2)", flexShrink: 0, marginLeft: 8 }}>
                      {site.plan}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
                    <UptimeBadge status={site.uptime_status} />
                    <SslBadge details={site.ssl_details} />
                    {site.pending_requests > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}>
                        {site.pending_requests} demande{site.pending_requests > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Email client + édition */}
                  {editingEmail === site.id ? (
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <input
                        autoFocus
                        type="email"
                        value={emailDraft[site.id] ?? site.client_email}
                        onChange={e => setEmailDraft(p => ({ ...p, [site.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") saveEmail(site.id); if (e.key === "Escape") setEditingEmail(null); }}
                        style={{ flex: 1, padding: "5px 9px", borderRadius: 6, border: "1px solid #6366f1", background: "var(--surface2)", color: "var(--text)", fontSize: 12, outline: "none" }}
                      />
                      <button onClick={() => saveEmail(site.id)} disabled={savingEmail === site.id}
                        style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)", color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Save size={11} />
                      </button>
                      <button onClick={() => setEditingEmail(null)}
                        style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingEmail(site.id); setEmailDraft(p => ({ ...p, [site.id]: site.client_email })); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", marginBottom: 8, borderRadius: 6, border: "1px solid var(--bd)", background: "transparent", color: "var(--muted)", fontSize: 11, cursor: "pointer", textAlign: "left" }}
                    >
                      <Pencil size={10} />
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {site.client_email || "Ajouter un email client…"}
                      </span>
                    </button>
                  )}

                  {/* Admin token */}
                  {editingToken === site.id ? (
                    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                      <input
                        autoFocus
                        type="text"
                        placeholder="Mot de passe admin…"
                        value={tokenDraft[site.id] ?? tokens[site.id] ?? ""}
                        onChange={e => setTokenDraft(p => ({ ...p, [site.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") saveToken(site.id, site.site_url); if (e.key === "Escape") setEditingToken(null); }}
                        style={{ flex: 1, padding: "5px 9px", borderRadius: 6, border: "1px solid #6366f1", background: "var(--surface2)", color: "var(--text)", fontSize: 12, outline: "none" }}
                      />
                      <button onClick={() => saveToken(site.id, site.site_url)} disabled={savingToken === site.id}
                        style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.1)", color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Save size={11} />
                      </button>
                      <button onClick={() => setEditingToken(null)}
                        style={{ padding: "5px 9px", borderRadius: 6, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingToken(site.id); setTokenDraft(p => ({ ...p, [site.id]: tokens[site.id] ?? "" })); }}
                      title={`Clé : ${tokenKey(site.site_url)}`}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 5, padding: "5px 9px", marginBottom: 8, borderRadius: 6, border: "1px solid var(--bd)", background: "transparent", color: "var(--muted)", fontSize: 11, cursor: "pointer", textAlign: "left" }}
                    >
                      <KeyRound size={10} />
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tokens[site.id] ? "••••••••" : "Définir le mot de passe admin…"}
                      </span>
                      <Pencil size={9} style={{ flexShrink: 0 }} />
                    </button>
                  )}

                  <button onClick={() => runCheck(site.id)} disabled={checking === site.id}
                    style={{ width: "100%", padding: "7px", borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text2)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: checking === site.id ? 0.6 : 1 }}>
                    <RefreshCw size={11} style={{ animation: checking === site.id ? "spin 1s linear infinite" : "none" }} />
                    {checking === site.id ? "Vérification…" : "Vérifier maintenant"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* History */}
        {history.length > 0 && (
          <section>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Historique
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.slice(0, 20).map(req => {
                const statusMap: Record<string, { color: string; label: string }> = {
                  approved: { color: "#6366F1", label: "Validée" },
                  done:     { color: "#10B981", label: "Appliquée" },
                  rejected: { color: "#EF4444", label: "Refusée" },
                };
                const s = statusMap[req.status] ?? { color: "var(--muted)", label: req.status };
                return (
                  <div key={req.id} style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 9, padding: "10px 14px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <Clock size={12} style={{ color: "var(--muted2)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", flexShrink: 0 }}>{req.client_name}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", flex: 1, minWidth: 100 }}>{req.message.slice(0, 70)}{req.message.length > 70 ? "…" : ""}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, flexShrink: 0 }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </>)}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
