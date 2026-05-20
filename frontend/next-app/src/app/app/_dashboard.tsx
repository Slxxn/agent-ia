"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Plus, Search, Loader2, LayoutGrid, List, X, ChevronDown,
  Trash2, ArrowRight, Users,
} from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Project, getProjects, createProject, deleteProject, startProject, streamProjects, getSettings, saveSetting } from "@/lib/api";
import { useClientRequests } from "@/hooks/useClientRequests";

type BudgetMode = "fast" | "balanced" | "quality";
const BUDGET_MODES: { key: BudgetMode; label: string; color: string }[] = [
  { key: "fast",     label: "Rapide",    color: "#6B7280" },
  { key: "balanced", label: "Équilibré", color: "#6366F1" },
  { key: "quality",  label: "Qualité",   color: "#6366F1" },
];

function LlmModeToggle() {
  const [mode, setMode] = useState<BudgetMode>("balanced");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      const s = settings.find((s) => s.key === "LLM_BUDGET_MODE");
      if (s?.value && ["fast","balanced","quality"].includes(s.value)) setMode(s.value as BudgetMode);
    }).catch(() => {});
  }, []);

  const handleSelect = async (m: BudgetMode) => {
    if (m === mode || saving) return;
    setMode(m);
    setSaving(true);
    try { await saveSetting("LLM_BUDGET_MODE", m); } catch {} finally { setSaving(false); }
  };

  const active = BUDGET_MODES.find((m) => m.key === mode)!;
  void active;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px", borderRadius: 9, background: "var(--surface2)", border: "1px solid var(--bd-bright)", opacity: saving ? 0.7 : 1, transition: "opacity 0.15s" }}>
      {BUDGET_MODES.map((m) => (
        <button key={m.key} onClick={() => handleSelect(m.key)}
          style={{ height: 26, padding: "0 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: mode === m.key ? 700 : 500, fontFamily: "inherit", transition: "all 0.15s",
            background: mode === m.key ? `${m.color}22` : "transparent",
            color: mode === m.key ? m.color : "var(--muted)",
            boxShadow: mode === m.key ? `inset 0 0 0 1px ${m.color}44` : "none",
          }}>
          {m.label}
        </button>
      ))}
    </div>
  );
}

type SortKey = "newest" | "oldest" | "progress";
type FilterStatus = "all" | "running" | "done" | "error" | "idle" | "paused";
type ViewMode = "grid" | "list";

function ProjectRow({ project, onDelete, index }: { project: Project; onDelete: (id: number) => void; index: number }) {
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
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a href={`/project?id=${project.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 500, color: "var(--accent)", textDecoration: "none", padding: "4px 8px", borderRadius: 6 }}>
            Voir <ArrowRight size={10} />
          </a>
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

function CreatePanel({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (name: string, desc: string, objective: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [objective, setObjective] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const reset = () => { setName(""); setDesc(""); setObjective(""); setErr(""); };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Le nom est requis."); return; }
    setLoading(true); setErr("");
    try { await onCreate(name.trim(), desc.trim(), objective.trim()); reset(); onClose(); }
    catch (ex) { setErr(ex instanceof Error ? ex.message : "Erreur lors de la création."); }
    finally { setLoading(false); }
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { onClose(); reset(); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 40 }}
          />
          <motion.div
            initial={{ opacity: 0, x: 340 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 340 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.38 }}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "var(--surface)", borderLeft: "1px solid var(--bd-bright)", zIndex: 41, display: "flex", flexDirection: "column", boxShadow: "-24px 0 80px rgba(0,0,0,0.6)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--bd)" }}>
              <div>
                <h2 style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Nouveau projet</h2>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>L'agent génèrera votre projet automatiquement</p>
              </div>
              <button onClick={() => { onClose(); reset(); }} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface3)", color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={13} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto" }}>
              {[
                { label: "Nom du projet *", value: name, onChange: setName, type: "text", placeholder: "Ex : Mon application React", rows: undefined },
                { label: "Description (optionnel)", value: desc, onChange: setDesc, type: "textarea", placeholder: "Décrivez brièvement…", rows: 2 },
              ].map(({ label, value, onChange, type, placeholder, rows }) => (
                <div key={label}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", display: "block", marginBottom: 5 }}>{label}</label>
                  {type === "textarea" ? (
                    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
                      style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
                    />
                  ) : (
                    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus
                      style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
                    />
                  )}
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", display: "block", marginBottom: 5 }}>
                  Objectif de l'agent{" "}
                  <span style={{ color: "var(--muted2)", fontWeight: 400 }}>(démarre automatiquement)</span>
                </label>
                <textarea value={objective} onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex : Crée une landing page SaaS premium…"
                  rows={5}
                  style={{ width: "100%", padding: "8px 11px", borderRadius: 8, border: `1px solid ${objective ? "var(--primary-border)" : "var(--bd-bright)"}`, background: objective ? "rgba(99,102,241,0.04)" : "var(--surface2)", color: "var(--text)", fontSize: 13, outline: "none", resize: "none", lineHeight: 1.55, fontFamily: "inherit", transition: "border-color 0.15s" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }} onBlur={(e) => { e.target.style.borderColor = objective ? "var(--primary-border)" : "var(--bd-bright)"; }}
                />
                {objective && <p style={{ fontSize: 11, color: "var(--primary)", marginTop: 4 }}>L'agent démarrera automatiquement</p>}
              </div>
              {err && <div style={{ fontSize: 12, color: "var(--error)", padding: "7px 11px", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 7 }}>{err}</div>}
              <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                <button type="button" onClick={() => { onClose(); reset(); }}
                  style={{ flex: 1, height: 36, borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface3)", color: "var(--text2)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Annuler
                </button>
                <button type="submit" disabled={loading || !name.trim()}
                  style={{ flex: 2, height: 36, borderRadius: 8, border: "none", background: !name.trim() ? "var(--surface3)" : "var(--primary)", color: !name.trim() ? "var(--muted)" : "white", fontSize: 13, fontWeight: 600, cursor: loading || !name.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
                  {loading ? <><Loader2 size={13} className="animate-spin" />Création…</> : <><Plus size={13} />{objective ? "Créer & démarrer" : "Créer"}</>}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AppDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false));
    const unsub = streamProjects((data) => setProjects(data));
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const handleCreate = async (name: string, desc: string, objective: string) => {
    const p = await createProject(name, desc);
    setProjects((prev) => [p, ...prev]);
    if (objective) { try { await startProject(p.id, objective); } catch {} }
  };

  const handleDelete = async (id: number) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
            <a href="/crm" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", textDecoration: "none", marginLeft: 4 }}>
              <Users size={11} color="#F59E0B" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#F59E0B" }}>
                {pendingRequests.length} demande{pendingRequests.length !== 1 ? "s" : ""} en attente
              </span>
            </a>
          )}

          <div style={{ flex: 1 }} />

          <LlmModeToggle />

          <button onClick={() => setPanelOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 8, background: "var(--primary)", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0, boxShadow: "0 0 18px var(--primary-glow)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--primary)"; }}>
            <Plus size={13} /> Nouveau projet
          </button>
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
              <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 260, lineHeight: 1.6, marginBottom: 20 }}>
                Créez votre premier projet et laissez l'agent IA générer le code.
              </p>
              <button onClick={() => setPanelOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, background: "var(--primary)", color: "white", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px var(--primary-glow)" }}>
                <Plus size={13} /> Créer un projet
              </button>
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
                {filtered.map((p, i) => <ProjectRow key={p.id} project={p} onDelete={handleDelete} index={i} />)}
              </div>
            </div>
          )}
        </div>

      </div>

      <CreatePanel open={panelOpen} onClose={() => setPanelOpen(false)} onCreate={handleCreate} />
    </>
  );
}
