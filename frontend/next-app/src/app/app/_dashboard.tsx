"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Search, LayoutGrid, List, X, ChevronDown,
  Trash2, ArrowRight, Users,
} from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Project, getProjects, deleteProject, streamProjects, sendPaymentLink } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "/api";

async function setProjectStatus(id: number, status: string, progress?: number) {
  await fetch(`${API}/projects/${id}/set-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, ...(progress !== undefined ? { progress } : {}) }),
  });
}
import { useClientRequests } from "@/hooks/useClientRequests";

type SortKey = "newest" | "oldest" | "progress";
type FilterStatus = "all" | "running" | "done" | "error" | "idle" | "paused";
type ViewMode = "grid" | "list";

function ProjectRow({ project, onDelete, onStatusChange, index }: { project: Project; onDelete: (id: number) => void; onStatusChange: (id: number, status: string) => void; index: number }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const color =
    project.status === "error"  ? "var(--error)"
    : project.status === "done"   ? "var(--success)"
    : project.status === "paused" ? "var(--warning)"
    : "var(--running)";
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 150px 80px 80px",
          alignItems: "center", gap: 12,
          padding: "9px 14px",
          borderBottom: "1px solid var(--bd)",
        }}
        whileHover={{ backgroundColor: "rgba(19,19,28,0.6)" }}
      >
        <a href={`/project?id=${project.id}`} style={{ textDecoration: "none", minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.name}
          </div>
          {project.description && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {project.description}
            </div>
          )}
        </a>
        <StatusBadge status={project.status as any} size="sm" />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>
            <span>Progression</span>
            <span style={{ color, fontWeight: 600 }}>{Math.round(project.progress)}%</span>
          </div>
          <div style={{ height: 3, background: "var(--surface3)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${project.progress}%`, background: color, borderRadius: 99, transition: "width 0.6s" }} />
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted2)" }}>
          {new Date(project.created_at).toLocaleDateString("fr-FR")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <a href={`/project?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 500, color: "var(--accent)", textDecoration: "none", padding: "4px 8px", borderRadius: 6 }}>
            Voir <ArrowRight size={10} />
          </a>
          {/* Contrôles statut manuel */}
          {project.status !== "running" && project.status !== "done" && (
            <button
              onClick={async () => { await setProjectStatus(project.id, "running", 10); onStatusChange(project.id, "running"); }}
              title="Marquer en cours"
              style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", color: "#818cf8", cursor: "pointer", fontFamily: "inherit" }}
            >
              🔨 En cours
            </button>
          )}
          {project.status !== "done" && (
            <button
              onClick={async () => { await setProjectStatus(project.id, "done", 100); onStatusChange(project.id, "done"); }}
              title="Marquer comme livré"
              style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", cursor: "pointer", fontFamily: "inherit" }}
            >
              ✓ Livré
            </button>
          )}
          {project.status === "done" && (
            <button
              onClick={async () => { await setProjectStatus(project.id, "idle", 0); onStatusChange(project.id, "idle"); }}
              title="Réinitialiser le statut"
              style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, border: "1px solid var(--bd-bright)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontFamily: "inherit" }}
            >
              ↺ Reset
            </button>
          )}
          {project.status !== "running" && (
            <button onClick={() => setDeleteOpen(true)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "transparent", color: "var(--muted2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </motion.div>
      <Modal
        open={deleteOpen}
        title="Supprimer le projet"
        description={`Voulez-vous vraiment supprimer "${project.name}" ?`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => { setDeleteOpen(false); onDelete(project.id); }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

export default function AppDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    getProjects().then(p => setProjects(p.filter(x => x.form_status !== 'crm_pending'))).catch(() => {}).finally(() => setLoading(false));
    const unsub = streamProjects((data) => setProjects(data.filter(x => x.form_status !== 'crm_pending')));
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const handleDelete = async (id: number) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const [finalPrices, setFinalPrices] = useState<Record<number, number>>({});
  const [sendingPayment, setSendingPayment] = useState<number | null>(null);
  const [paymentSent, setPaymentSent] = useState<Set<number>>(new Set());

  const pendingValidation = useMemo(
    () => projects.filter((p) => p.form_status === "pending_validation"),
    [projects]
  );

  const handleSendPayment = async (project: Project) => {
    setSendingPayment(project.id);
    try {
      const price = finalPrices[project.id] ?? project.suggested_price ?? project.final_price ?? 390;
      const res = await sendPaymentLink(project.id, price);
      if (res.payment_url) window.open(res.payment_url, "_blank");
      setPaymentSent((prev) => { const next = new Set(prev); next.add(project.id); return next; });
      setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, form_status: "payment_sent" } : p));
    } catch { alert("Erreur lors de l'envoi du lien de paiement."); }
    finally { setSendingPayment(null); }
  };

  const stats = useMemo(() => ({
    total:  projects.length,
    active: projects.filter((p) => p.status === "running" || p.status === "paused").length,
    done:   projects.filter((p) => p.status === "done").length,
    error:  projects.filter((p) => p.status === "error").length,
  }), [projects]);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (filterStatus !== "all") list = list.filter((p) => p.status === filterStatus);
    list.sort((a, b) => {
      if (sort === "newest")   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest")   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "progress") return b.progress - a.progress;
      return 0;
    });
    return list;
  }, [projects, search, filterStatus, sort]);

  const filterLabels: Record<FilterStatus, string> = {
    all: "Tous", running: "En cours", done: "Terminés",
    error: "Erreurs", idle: "Inactifs", paused: "En pause",
  };
  const sortLabels: Record<SortKey, string> = {
    newest: "Récents", oldest: "Anciens", progress: "Progression",
  };

  const { requests: crmRequests } = useClientRequests();
  const pendingRequests = useMemo(() => crmRequests.filter((r) => r.status === "pending"), [crmRequests]);

  const StatPill = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: "var(--surface2)", border: "1px solid var(--bd-bright)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{value}</span>
      <span style={{ fontSize: 11, color: "var(--muted)" }}>{label}</span>
    </div>
  );

  const DropBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 32, padding: "0 10px", borderRadius: 7, border: `1px solid ${active ? "var(--primary-border)" : "var(--bd-bright)"}`, background: active ? "var(--primary-muted)" : "var(--surface)", color: active ? "var(--accent)" : "var(--text2)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {label} <ChevronDown size={10} style={{ opacity: 0.6 }} />
    </button>
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0, padding: "16px 24px 12px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginRight: 4 }}>
            Dashboard
          </h1>

          {!loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatPill value={stats.total}  label="projets"  color="var(--muted2)" />
              <StatPill value={stats.active} label="actifs"   color="var(--running)" />
              <StatPill value={stats.done}   label="terminés" color="var(--success)" />
              {stats.error > 0 && <StatPill value={stats.error} label="erreurs" color="var(--error)" />}
            </div>
          )}

          {pendingRequests.length > 0 && (
            <a href="/app/crm" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", textDecoration: "none", marginLeft: 4 }}>
              <Users size={11} color="#F59E0B" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#F59E0B" }}>
                {pendingRequests.length} demande{pendingRequests.length !== 1 ? "s" : ""} en attente
              </span>
            </a>
          )}

          <div style={{ flex: 1 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexShrink: 0 }}>
          <div style={{ position: "relative", flex: "1 1 180px", minWidth: 120 }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…"
              style={{ width: "100%", height: 32, paddingLeft: 28, paddingRight: search ? 26 : 8, borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "inherit" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, borderRadius: 99, border: "none", background: "var(--surface3)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={9} />
              </button>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <DropBtn label={filterLabels[filterStatus]} active={filterStatus !== "all"} onClick={() => { setFilterOpen((v) => !v); setSortOpen(false); }} />
            {filterOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setFilterOpen(false)} />
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20, background: "var(--surface2)", border: "1px solid var(--bd-bright)", borderRadius: 9, padding: 4, minWidth: 150, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                  {(["all","running","paused","done","error","idle"] as FilterStatus[]).map((s) => (
                    <div key={s} onClick={() => { setFilterStatus(s); setFilterOpen(false); }}
                      style={{ padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", color: filterStatus === s ? "var(--primary)" : "var(--text2)", background: filterStatus === s ? "var(--primary-muted)" : "transparent" }}
                      onMouseEnter={(e) => { if (filterStatus !== s) (e.currentTarget as HTMLElement).style.background = "var(--surface3)"; }}
                      onMouseLeave={(e) => { if (filterStatus !== s) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      {filterLabels[s]}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <DropBtn label={sortLabels[sort]} active={false} onClick={() => { setSortOpen((v) => !v); setFilterOpen(false); }} />
            {sortOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setSortOpen(false)} />
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 20, background: "var(--surface2)", border: "1px solid var(--bd-bright)", borderRadius: 9, padding: 4, minWidth: 140, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                  {(["newest","oldest","progress"] as SortKey[]).map((s) => (
                    <div key={s} onClick={() => { setSort(s); setSortOpen(false); }}
                      style={{ padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", color: sort === s ? "var(--primary)" : "var(--text2)", background: sort === s ? "var(--primary-muted)" : "transparent" }}
                      onMouseEnter={(e) => { if (sort !== s) (e.currentTarget as HTMLElement).style.background = "var(--surface3)"; }}
                      onMouseLeave={(e) => { if (sort !== s) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      {sortLabels[s]}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", border: "1px solid var(--bd-bright)", borderRadius: 7, overflow: "hidden", background: "var(--surface)" }}>
            {(["grid","list"] as ViewMode[]).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                style={{ width: 32, height: 32, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === m ? "var(--primary-muted)" : "transparent", color: viewMode === m ? "var(--primary)" : "var(--muted)", transition: "all 0.15s" }}>
                {m === "grid" ? <LayoutGrid size={13} /> : <List size={13} />}
              </button>
            ))}
          </div>

          {!loading && (
            <span style={{ fontSize: 11, color: "var(--muted2)", whiteSpace: "nowrap", marginLeft: 2 }}>
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Devis en attente de validation ── */}
        {pendingValidation.length > 0 && (
          <div style={{ marginBottom: 10, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px #F59E0B", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {pendingValidation.length} devis à valider
              </span>
            </div>
            {pendingValidation.map((p) => {
              let brief: Record<string, unknown> = {};
              try { if (p.brief) brief = JSON.parse(p.brief); } catch {}
              const sector     = brief.sector as string || "";
              const siteType   = (brief.siteType || brief.site_type) as string || "standard";
              const desc       = (brief.description as string || p.description || "").slice(0, 100);
              const pages      = (brief.pages as string[] || []).slice(0, 4);
              const features   = (brief.features as string[] || []).slice(0, 3);
              const goal       = brief.siteGoal as string || "";
              const SECTOR_EMOJI: Record<string, string> = { beaute: "💅", restaurant: "🍽️", mode: "👗", artisan: "🎨", coach: "🧠", photo: "📸", medical: "🩺", immobilier: "🏠", sport: "💪", tech: "💻", association: "🤝" };
              const TYPE_LABEL: Record<string, string> = { standard: "Vitrine", "3d": "3D / WebGL", scrollytelling: "Scrollytelling" };
              const GOAL_LABEL: Record<string, string> = { bookings: "Réservations", ecommerce: "Vente en ligne", portfolio: "Portfolio", leads: "Génération leads", showcase: "Vitrine" };
              return (
                <div key={p.id} style={{ background: "var(--surface)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

                  {/* ── Infos brief ── */}
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                        {SECTOR_EMOJI[sector] || "✨"} {p.name}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(99,102,241,0.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
                        {TYPE_LABEL[siteType] || siteType}
                      </span>
                      {goal && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(16,185,129,0.08)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                          {GOAL_LABEL[goal] || goal}
                        </span>
                      )}
                    </div>

                    {p.client_email && (
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: desc ? 5 : 0 }}>
                        {p.client_email}{p.client_phone ? ` · ${p.client_phone}` : ""}
                      </div>
                    )}

                    {desc && (
                      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.55, margin: "0 0 8px", maxWidth: 480 }}>
                        {desc}{(brief.description as string || "").length > 100 ? "…" : ""}
                      </p>
                    )}

                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {pages.map(pg => (
                        <span key={pg} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "var(--surface2)", color: "var(--muted2)", border: "1px solid var(--bd)" }}>{pg}</span>
                      ))}
                      {features.map(ft => (
                        <span key={ft} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "var(--surface2)", color: "var(--muted2)", border: "1px solid var(--bd)" }}>{ft}</span>
                      ))}
                    </div>
                  </div>

                  {/* ── Prix + CTA ── */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "right" }}>
                      Suggéré : <strong style={{ color: "var(--text)" }}>{p.suggested_price || 390}€</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" defaultValue={p.suggested_price || p.final_price || 390}
                        onChange={(e) => setFinalPrices((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))}
                        style={{ width: 76, height: 32, padding: "0 8px", borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "inherit", textAlign: "center" }}
                      />
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>€</span>
                      <button onClick={() => handleSendPayment(p)} disabled={sendingPayment === p.id || paymentSent.has(p.id)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 7, border: "none", background: paymentSent.has(p.id) ? "rgba(16,185,129,0.15)" : "var(--primary)", color: paymentSent.has(p.id) ? "#10B981" : "white", fontSize: 12, fontWeight: 600, cursor: sendingPayment === p.id ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: sendingPayment === p.id ? 0.6 : 1, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                        {paymentSent.has(p.id) ? "✓ Envoyé" : sendingPayment === p.id ? "Envoi…" : "💳 Envoyer le lien"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, overflowY: "auto", height: "100%", paddingRight: 4, alignContent: "start" }}>
              {[0,1,2,3,4,5].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--bd-bright)", borderRadius: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--primary-muted)", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: "var(--primary)" }}>
                <FolderOpen size={20} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>Aucun projet</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 260, lineHeight: 1.6 }}>
                Les projets arrivent automatiquement via le CRM.
              </p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 12, color: "var(--muted)", gap: 8 }}>
              <Search size={20} style={{ opacity: 0.4 }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>Aucun résultat</p>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Modifiez vos critères de recherche ou de filtre.</p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, overflowY: "auto", height: "100%", paddingRight: 4, alignContent: "start", paddingBottom: 8 }}>
              {filtered.map((p, i) => <ProjectCard key={p.id} project={p} onDelete={handleDelete} index={i} />)}
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 12, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 150px 80px 80px", gap: 12, padding: "8px 14px", background: "var(--surface2)", borderBottom: "1px solid var(--bd)", flexShrink: 0 }}>
                {["Projet", "Statut", "Progression", "Créé", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                ))}
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {filtered.map((p, i) => <ProjectRow key={p.id} project={p} onDelete={handleDelete} onStatusChange={(id, status) => setProjects(prev => prev.map(x => x.id === id ? { ...x, status: status as Project["status"], progress: status === "done" ? 100 : status === "idle" ? 0 : 10 } : x))} index={i} />)}
              </div>
            </div>
          )}
        </div>

      </div>

    </>
  );
}
