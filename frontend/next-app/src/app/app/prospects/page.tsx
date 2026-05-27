"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, Zap, Target, Globe, Phone, ChevronDown, X, Copy, Check, ArrowRight, RefreshCw, CheckCircle2, XCircle, Trash2, Send, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

const SECTORS = [
  "coiffeur", "restaurant", "boulangerie", "plombier",
  "électricien", "menuisier", "médecin", "dentiste",
  "avocat", "comptable", "agence immobilière", "fleuriste",
  "garage automobile", "photographe",
];

interface Prospect {
  id: string;
  name: string;
  sector: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  score: number;
  priority: "hot" | "warm" | "cold";
  status: string;
  pitch?: string;
  notes?: string;
}

interface ScraperStatus {
  pages_jaunes: { ok: boolean; message: string };
  data_gouv: { ok: boolean; message: string };
  last_auto_scan?: string | null;
}

function formatLastScan(iso: string | null | undefined): string {
  if (!iso) return "Jamais";
  const d = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
  if (diffH < 1) return "Il y a < 1h";
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `Il y a ${diffD}j`;
}

const ProspectsMap = dynamic(() => import("./ProspectsMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)", borderRadius: 10 }}>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>Chargement de la carte…</span>
    </div>
  ),
});

const PRIORITY_COLORS = {
  hot:  { bg: "rgba(239,68,68,0.12)",   color: "#EF4444", border: "rgba(239,68,68,0.25)",   label: "Chaud" },
  warm: { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B", border: "rgba(245,158,11,0.25)",  label: "Tiède" },
  cold: { bg: "rgba(100,116,139,0.12)", color: "#64748B", border: "rgba(100,116,139,0.25)", label: "Froid" },
};

const SCORE_COLOR = (s: number) =>
  s >= 60 ? "#22C55E" : s >= 35 ? "#F59E0B" : "#64748B";

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [selected, setSelected] = useState<Prospect | null>(null);

  // Statut sources
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Vider la base
  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (!confirm(`Supprimer les ${stats.total} prospects ? Cette action est irréversible.`)) return;
    setClearing(true);
    try {
      await fetch(`${API}/prospects/`, { method: "DELETE" });
      setProspects([]);
      setSelected(null);
    } finally {
      setClearing(false);
    }
  };

  // Scan modal
  const [scanOpen, setScanOpen] = useState(false);
  const [scanSector, setScanSector] = useState("all");
  const [scanCity, setScanCity] = useState("Montpellier");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Pitch modal
  const [pitchOpen, setPitchOpen] = useState(false);
  const [pitchData, setPitchData] = useState<{ subject: string; pitch: string } | null>(null);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [pitchCopied, setPitchCopied] = useState(false);
  const [pitchEmail, setPitchEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const fetchProspects = useCallback(async () => {
    try {
      const res = await fetch(`${API}/prospects/`);
      if (res.ok) setProspects(await res.json());
    } catch { /* API not reachable */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async (city = "Montpellier") => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API}/prospects/status?city=${encodeURIComponent(city)}`);
      if (res.ok) setScraperStatus(await res.json());
    } catch { /* ignore */ } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchProspects();
    fetchStatus();
  }, [fetchProspects, fetchStatus]);

  const handleScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch(`${API}/prospects/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector: scanSector, city: scanCity, max_results: 20 }),
        // timeout long pour le scan complet (fetch n'a pas de timeout natif mais on laisse le browser gérer)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur scan");
      const msg = scanSector === "all"
        ? `${data.scanned} nouveaux prospects · ${data.sectors_done} secteurs · ${data.elapsed_seconds}s`
        : `${data.scanned} nouveaux prospects trouvés`;
      setScanResult({ ok: true, message: msg });
      await fetchProspects();
    } catch (e: unknown) {
      setScanResult({ ok: false, message: e instanceof Error ? e.message : "Erreur" });
    } finally {
      setScanning(false);
    }
  };

  const handleSendEmail = async () => {
    if (!pitchData || !selected || !pitchEmail.trim()) return;
    setSendingEmail(true); setEmailError(""); setEmailSent(false);
    try {
      const res = await fetch(`${API}/prospects/${selected.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: pitchEmail.trim(), subject: pitchData.subject, body: pitchData.pitch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur envoi");
      setEmailSent(true);
      setProspects(prev => prev.map(x => x.id === selected.id ? { ...x, status: "contacted", email: pitchEmail } : x));
    } catch (e: unknown) {
      setEmailError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGeneratePitch = async (p: Prospect) => {
    setSelected(p); setPitchOpen(true); setGeneratingPitch(true); setPitchData(null);
    setPitchEmail(p.email || ""); setEmailSent(false); setEmailError("");
    try {
      const res = await fetch(`${API}/prospects/${p.id}/pitch`, { method: "POST" });
      const data = await res.json();
      setPitchData(data);
      setProspects(prev => prev.map(x => x.id === p.id ? { ...x, pitch: data.pitch } : x));
    } finally {
      setGeneratingPitch(false);
    }
  };

  const handleMarkContacted = async (p: Prospect) => {
    await fetch(`${API}/prospects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "contacted" }),
    });
    setProspects(prev => prev.map(x => x.id === p.id ? { ...x, status: "contacted" } : x));
  };

  const handleConvert = async (p: Prospect) => {
    const res = await fetch(`${API}/prospects/${p.id}/convert`, { method: "POST" });
    const data = await res.json();
    if (data.ok) {
      setProspects(prev => prev.map(x => x.id === p.id ? { ...x, status: "converted" } : x));
      const params = new URLSearchParams({ businessName: data.prefill.businessName, sector: data.prefill.sector });
      router.push(`/form?${params}`);
    }
  };

  const filtered = prospects.filter(p => filter === "all" ? true : p.priority === filter);
  const stats = {
    total: prospects.length,
    hot: prospects.filter(p => p.priority === "hot").length,
    warm: prospects.filter(p => p.priority === "warm").length,
    cold: prospects.filter(p => p.priority === "cold").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid var(--bd)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, position: "sticky", top: 0, background: "var(--bg)", zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
            <Target size={16} style={{ color: "#EF4444" }} /> Prospect Hunter
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {stats.total} prospects · {stats.hot} chauds · {stats.warm} tièdes
          </p>
          {scraperStatus && (
            <p style={{ fontSize: 11, color: "var(--muted2)", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <RefreshCw size={9} />
              Dernier scan auto : {formatLastScan(scraperStatus.last_auto_scan)}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Badges statut sources */}
          {scraperStatus && (
            <div style={{ display: "flex", gap: 5 }}>
              <StatusBadge label="Enrichissement" ok={scraperStatus.pages_jaunes.ok} message={scraperStatus.pages_jaunes.message} />
              <StatusBadge label="data.gouv" ok={scraperStatus.data_gouv.ok} message={scraperStatus.data_gouv.message} />
            </div>
          )}
          <button
            onClick={() => fetchStatus(scanCity)}
            disabled={loadingStatus}
            title="Vérifier les sources"
            style={{ background: "var(--surface2)", border: "1px solid var(--bd)", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center" }}
          >
            <RefreshCw size={12} style={{ animation: loadingStatus ? "spin 1s linear infinite" : "none" }} />
          </button>
          {stats.total > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              title="Vider tous les prospects"
              style={{ background: "var(--surface2)", border: "1px solid var(--bd)", borderRadius: 7, padding: "6px 8px", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center", opacity: clearing ? 0.6 : 1 }}
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={() => { setScanOpen(true); setScanResult(null); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Zap size={13} /> Nouveau scan
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 300, margin: "12px 16px 0", borderRadius: 10, overflow: "hidden", border: "1px solid var(--bd)", flexShrink: 0 }}>
        <ProspectsMap prospects={filtered} onSelect={setSelected} selected={selected} />
      </div>

      {/* Stats chips */}
      <div style={{ display: "flex", gap: 6, padding: "12px 16px 8px", flexWrap: "wrap" }}>
        {(["all", "hot", "warm", "cold"] as const).map(f => {
          const count = f === "all" ? stats.total : stats[f];
          const label = f === "all" ? "Tous" : PRIORITY_COLORS[f].label;
          const color = f === "all" ? "var(--accent)" : PRIORITY_COLORS[f].color;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: `1px solid ${filter === f ? color : "var(--bd-bright)"}`, background: filter === f ? `${color}18` : "var(--surface2)", color: filter === f ? color : "var(--muted)", cursor: "pointer", transition: "all 0.15s" }}>
              {label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ padding: "0 16px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
              {prospects.length === 0 ? "Aucun prospect. Lancez un scan pour en trouver." : "Aucun prospect pour ce filtre."}
            </p>
            {prospects.length === 0 && (
              <button onClick={() => setScanOpen(true)} style={{ padding: "8px 16px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Lancer un scan
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(p => {
              const pri = PRIORITY_COLORS[p.priority] ?? PRIORITY_COLORS.cold;
              return (
                <div key={p.id} style={{ background: selected?.id === p.id ? "var(--surface3)" : "var(--surface)", border: `1px solid ${selected?.id === p.id ? "var(--accent)" : "var(--bd)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer", transition: "all 0.15s" }} onClick={() => setSelected(selected?.id === p.id ? null : p)}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${SCORE_COLOR(p.score)}18`, border: `1px solid ${SCORE_COLOR(p.score)}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SCORE_COLOR(p.score) }}>{p.score}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: pri.bg, color: pri.color, border: `1px solid ${pri.border}` }}>{pri.label}</span>
                      {p.status === "contacted" && <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: "rgba(99,102,241,0.1)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.2)" }}>Contacté</span>}
                      {p.status === "converted" && <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>Converti</span>}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{p.sector}</span>
                      <span style={{ fontSize: 11, color: "var(--muted2)" }}>{p.city}</span>
                      {p.phone && <span style={{ fontSize: 11, color: "var(--muted2)", display: "flex", alignItems: "center", gap: 3 }}><Phone size={9} />{p.phone}</span>}
                      {p.website ? (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
                          <Globe size={9} />{p.website.replace(/^https?:\/\//, "").split("/")[0]}
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 500 }}>Pas de site</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <ActionBtn label="Pitch" icon={<Zap size={11} />} color="#6366F1" onClick={() => handleGeneratePitch(p)} />
                    {p.status !== "contacted" && p.status !== "converted" && (
                      <ActionBtn label="Contacté" icon={<Check size={11} />} color="#10B981" onClick={() => handleMarkContacted(p)} />
                    )}
                    {p.status !== "converted" && (
                      <ActionBtn label="Convertir" icon={<ArrowRight size={11} />} color="#F59E0B" onClick={() => handleConvert(p)} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scan Modal */}
      {scanOpen && (
        <Modal onClose={() => { setScanOpen(false); setScanResult(null); }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 7 }}>
            <Search size={15} /> Nouveau scan
          </h2>

          {/* Statut des sources dans la modal */}
          {scraperStatus && (
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              <StatusBadge label="Enrichissement" ok={scraperStatus.pages_jaunes.ok} message={scraperStatus.pages_jaunes.message} />
              <StatusBadge label="data.gouv" ok={scraperStatus.data_gouv.ok} message={scraperStatus.data_gouv.message} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 5 }}>Secteur</label>
              <div style={{ position: "relative" }}>
                <select
                  value={scanSector}
                  onChange={e => setScanSector(e.target.value)}
                  style={{ width: "100%", padding: "9px 32px 9px 12px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, appearance: "none", cursor: "pointer" }}
                >
                  <option value="all">Toutes les activités ({SECTORS.length} secteurs)</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
              </div>
              {scanSector === "all" && (
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>
                  Scrape les {SECTORS.length} secteurs en parallèle (PJ + data.gouv). Durée estimée : 30–60s.
                </p>
              )}
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 5 }}>Ville</label>
              <input
                value={scanCity}
                onChange={e => setScanCity(e.target.value)}
                placeholder="Montpellier"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, outline: "none" }}
              />
            </div>
            {scanResult && (
              <div style={{ fontSize: 12, color: scanResult.ok ? "#10B981" : "#EF4444", padding: "8px 12px", borderRadius: 7, background: scanResult.ok ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${scanResult.ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, display: "flex", alignItems: "center", gap: 6 }}>
                {scanResult.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {scanResult.message}
              </div>
            )}
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{ padding: "10px", borderRadius: 8, background: "#EF4444", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: scanning ? "not-allowed" : "pointer", opacity: scanning ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {scanning ? (
                <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
                {scanSector === "all" ? `Scan de ${SECTORS.length} secteurs en cours…` : "Scan en cours…"}</>
              ) : (
                <><Zap size={13} /> {scanSector === "all" ? `Scanner tous les secteurs` : "Lancer le scan"}</>
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* Pitch Modal */}
      {pitchOpen && selected && (
        <Modal onClose={() => setPitchOpen(false)} wide>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Email de prospection
          </h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>{selected.name}</p>
          {generatingPitch ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Génération en cours…</div>
          ) : pitchData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--bd)" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Objet</p>
                <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{pitchData.subject}</p>
              </div>
              <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px", border: "1px solid var(--bd)" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Corps</p>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{pitchData.pitch}</p>
              </div>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`Objet : ${pitchData.subject}\n\n${pitchData.pitch}`);
                  setPitchCopied(true);
                  setTimeout(() => setPitchCopied(false), 2500);
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: pitchCopied ? "#10B981" : "var(--text2)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
              >
                {pitchCopied ? <><Check size={13} /> Copié !</> : <><Copy size={13} /> Copier l&apos;email</>}
              </button>

              {/* Envoi direct via Resend */}
              <div style={{ borderTop: "1px solid var(--bd)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Mail size={11} /> Envoyer directement
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="email"
                    value={pitchEmail}
                    onChange={e => { setPitchEmail(e.target.value); setEmailSent(false); setEmailError(""); }}
                    placeholder="email@prospect.fr"
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, outline: "none" }}
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !pitchEmail.trim() || emailSent}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: emailSent ? "#10B981" : "#6366F1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: sendingEmail || !pitchEmail.trim() || emailSent ? "not-allowed" : "pointer", opacity: sendingEmail || !pitchEmail.trim() ? 0.6 : 1, transition: "all 0.15s", whiteSpace: "nowrap" }}
                  >
                    {emailSent ? <><Check size={13} /> Envoyé !</> : sendingEmail ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Envoi…</> : <><Send size={13} /> Envoyer</>}
                  </button>
                </div>
                {emailError && <p style={{ fontSize: 11, color: "#EF4444" }}>{emailError}</p>}
                {emailSent && <p style={{ fontSize: 11, color: "#10B981" }}>Email envoyé — prospect marqué comme contacté.</p>}
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function StatusBadge({ label, ok, message }: { label: string; ok: boolean; message: string }) {
  return (
    <div title={message} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: ok ? "#10B981" : "#EF4444", border: `1px solid ${ok ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, cursor: "default", whiteSpace: "nowrap" }}>
      {ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {label}
    </div>
  );
}

function ActionBtn({ label, icon, color, onClick }: { label: string; icon: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: `1px solid ${color}30`, background: `${color}10`, color, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {icon} {label}
    </button>
  );
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--bd-bright)", borderRadius: 12, padding: 24, width: "100%", maxWidth: wide ? 520 : 380, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 1 }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
