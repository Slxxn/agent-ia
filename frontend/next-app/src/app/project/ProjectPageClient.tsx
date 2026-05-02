"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Pause, Square, RotateCcw, Trash2,
  Terminal, FolderOpen, MessageSquare, KeyRound,
  Send, Loader2, CheckCircle2, ExternalLink, ScanEye, Rocket,
} from "lucide-react";
import LogViewer from "@/components/LogViewer";
import FileExplorer from "@/components/FileExplorer";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import {
  Project, getProject, startProject, stopProject, pauseProject,
  resumeProject, deleteProject, streamProject, sendChatMessage,
  getProjectEnv, updateProjectEnv, validateVisual, deployProject,
} from "@/lib/api";

type Tab = "logs" | "files" | "copilot" | "variables";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "logs",      label: "Logs",      icon: <Terminal size={12} /> },
  { key: "files",     label: "Fichiers",  icon: <FolderOpen size={12} /> },
  { key: "copilot",   label: "Copilote",  icon: <MessageSquare size={12} /> },
  { key: "variables", label: "Variables", icon: <KeyRound size={12} /> },
];

export default function ProjectPageClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const projectId    = parseInt(searchParams.get("id") ?? "0");

  const [project,       setProject]       = useState<Project | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [objective,     setObjective]     = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab,     setActiveTab]     = useState<Tab>("logs");
  const [deleteModal,   setDeleteModal]   = useState(false);

  const [chatMessages, setChatMessages] = useState<{ role: "user"|"agent"; text: string }[]>([]);
  const [chatInput,    setChatInput]    = useState("");
  const [chatLoading,  setChatLoading]  = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [envVars,    setEnvVars]    = useState<Record<string, string>>({});
  const [envLoading, setEnvLoading] = useState(false);
  const [envSaved,   setEnvSaved]   = useState(false);

  const [deployLoading, setDeployLoading] = useState(false);
  const [deployDone,    setDeployDone]    = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualDone,    setVisualDone]    = useState(false);
  const [mobilePanel,   setMobilePanel]   = useState<"controls"|"logs">("controls");
  const [isMobile,      setIsMobile]      = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getProject(projectId)
      .then((data) => { if (!cancelled) { setProject(data); if (data.objective) setObjective((p) => p || data.objective); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    const unsub = streamProject(projectId, (data) => { setProject(data); setError(null); });
    return () => { cancelled = true; if (typeof unsub === "function") unsub(); };
  }, [projectId]);

  useEffect(() => {
    if (!project || project.status !== "running") return;
    const interval = setInterval(async () => {
      try { const data = await getProject(projectId); setProject(data); } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [project?.status, projectId]);

  useEffect(() => {
    if (activeTab !== "variables") return;
    setEnvLoading(true);
    getProjectEnv(projectId).then(setEnvVars).catch(() => {}).finally(() => setEnvLoading(false));
  }, [activeTab, projectId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const wrap = (fn: () => Promise<void>) => async () => {
    try { setActionLoading(true); await fn(); const d = await getProject(projectId); setProject(d); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleStart = async () => {
    if (!objective.trim()) { alert("Veuillez entrer un objectif"); return; }
    await wrap(async () => { await startProject(projectId, objective); setObjective(""); })();
  };
  const handleStop   = wrap(() => stopProject(projectId));
  const handlePause  = wrap(() => pauseProject(projectId));
  const handleResume = wrap(() => resumeProject(projectId));

  const handleDeploy = async () => {
    setDeployLoading(true); setDeployDone(false);
    try { await deployProject(projectId); setDeployDone(true); setTimeout(() => setDeployDone(false), 4000); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur de déploiement"); }
    finally { setDeployLoading(false); }
  };

  const handleValidateVisual = async () => {
    setVisualLoading(true); setVisualDone(false);
    try { await validateVisual(projectId); setVisualDone(true); setTimeout(() => setVisualDone(false), 3000); }
    catch {}
    finally { setVisualLoading(false); }
  };

  const handleDelete = async () => {
    try { setActionLoading(true); await deleteProject(projectId); router.push("/"); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((p) => [...p, { role: "user", text: msg }]);
    setChatLoading(true);
    try {
      await sendChatMessage(projectId, msg);
      setChatMessages((p) => [...p, { role: "agent", text: "Modification en cours… Suivez l'avancement dans les Logs." }]);
    } catch {
      setChatMessages((p) => [...p, { role: "agent", text: "❌ Erreur lors de l'envoi du message." }]);
    } finally { setChatLoading(false); }
  };

  const handleSaveEnv = async () => {
    try { setEnvLoading(true); await updateProjectEnv(projectId, envVars); setEnvSaved(true); setTimeout(() => setEnvSaved(false), 3000); }
    catch { alert("Erreur lors de la sauvegarde."); }
    finally { setEnvLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 16, height: "100%", paddingTop: 16, paddingBottom: 12 }}>
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {[48, 80, 120, 100].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 10 }} />)}
        </div>
        <div className="skeleton" style={{ flex: 1, borderRadius: 12 }} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 20 }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
          <ArrowLeft size={13} /> Retour au dashboard
        </Link>
        <div style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: 14, color: "var(--error)", fontSize: 13 }}>
          {error || "Projet introuvable"}
        </div>
      </div>
    );
  }

  const statusColor =
    project.status === "error"  ? "var(--error)"
    : project.status === "done"   ? "var(--success)"
    : project.status === "paused" ? "var(--warning)"
    : "var(--running)";

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
    height: 34, paddingLeft: 12, paddingRight: 12, borderRadius: 7,
    fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
    transition: "background 0.15s, opacity 0.15s", fontFamily: "inherit", flexShrink: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", paddingTop: 14, paddingBottom: 10, overflow: "hidden" }}
    >
      {isMobile && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setMobilePanel("controls")} type="button"
            style={{ flex: 1, height: 34, borderRadius: 7, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: mobilePanel === "controls" ? "var(--primary)" : "var(--surface2)", color: mobilePanel === "controls" ? "white" : "var(--muted)" }}>
            Contrôles
          </button>
          <button onClick={() => setMobilePanel("logs")} type="button"
            style={{ flex: 1, height: 34, borderRadius: 7, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: mobilePanel === "logs" ? "var(--primary)" : "var(--surface2)", color: mobilePanel === "logs" ? "white" : "var(--muted)" }}>
            Logs
          </button>
        </div>
      )}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", gap: 12 }}>
      <div style={{ width: isMobile ? "100%" : 300, flexShrink: 0, display: isMobile && mobilePanel !== "controls" ? "none" : "flex", flexDirection: "column", gap: 8, overflowY: "auto", paddingRight: 4 }}>
        <div>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 11, textDecoration: "none", marginBottom: 8 }}>
            <ArrowLeft size={11} /> Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {project.name}
              </h1>
              {project.description && (
                <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.description}</p>
              )}
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "6px 10px", background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 8 }}>
          <span style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "monospace" }}>#{project.id}</span>
          <span style={{ fontSize: 10, color: "var(--bd-bright)" }}>·</span>
          <span style={{ fontSize: 10, color: "var(--muted2)" }}>{new Date(project.created_at).toLocaleDateString("fr-FR")}</span>
          {project.deploy_url && (
            <>
              <span style={{ fontSize: 10, color: "var(--bd-bright)" }}>·</span>
              <a href={project.deploy_url} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 600, color: "var(--success)", textDecoration: "none", background: "var(--success-bg)", border: "1px solid var(--success-border)", borderRadius: 4, padding: "1px 5px" }}>
                <ExternalLink size={9} /> Live
              </a>
            </>
          )}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Progression</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: statusColor, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {Math.round(project.progress)}%
            </span>
          </div>
          <div style={{ width: "100%", height: 5, background: "var(--surface3)", borderRadius: 99, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%", background: statusColor, borderRadius: 99, position: "relative", overflow: "hidden" }}
            >
              {project.status === "running" && <span className="progress-shimmer" style={{ position: "absolute", inset: 0 }} />}
            </motion.div>
          </div>
          {project.status === "running" && (
            <p style={{ fontSize: 10, color: "var(--running)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <span className="dot-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--running)", display: "inline-block" }} />
              Agent en cours d&apos;exécution…
            </p>
          )}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 10, padding: "12px 14px" }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>Contrôle</span>

          {(project.status === "idle" || project.status === "done" || project.status === "error") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder={project.status === "idle" ? "Décrivez l'objectif du projet…" : "Nouvel objectif ou modification…"}
                rows={3}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 12, outline: "none", resize: "none", lineHeight: 1.5, fontFamily: "inherit" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
              />
              <button onClick={handleStart} disabled={actionLoading || !objective.trim()}
                style={{ ...btnBase, width: "100%", background: !objective.trim() ? "var(--surface3)" : project.status === "error" ? "var(--error-bg)" : "var(--primary)", color: !objective.trim() ? "var(--muted)" : project.status === "error" ? "var(--error)" : "white", border: project.status === "error" ? "1px solid var(--error-border)" : "none", opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? <><Loader2 size={12} className="animate-spin" /> Démarrage…</> :
                 project.status === "error" ? <><RotateCcw size={12} /> Réessayer</> :
                 project.status === "done"  ? <><RotateCcw size={12} /> Relancer</> :
                 <><Play size={12} fill="currentColor" /> Démarrer</>}
              </button>
            </div>
          )}

          {project.status === "running" && (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handlePause} disabled={actionLoading} style={{ ...btnBase, flex: 1, background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning-border)" }}>
                <Pause size={12} fill="currentColor" /> Pause
              </button>
              <button onClick={handleStop} disabled={actionLoading} style={{ ...btnBase, flex: 1, background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error-border)" }}>
                <Square size={12} fill="currentColor" /> Stop
              </button>
            </div>
          )}

          {project.status === "paused" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)", borderRadius: 7, padding: "8px 10px", fontSize: 11, color: "var(--warning)", lineHeight: 1.5 }}>
                En pause. Remplissez les variables si nécessaire, puis reprenez.
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleResume} disabled={actionLoading} style={{ ...btnBase, flex: 1, background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }}>
                  <Play size={12} fill="currentColor" /> Reprendre
                </button>
                <button onClick={handleStop} disabled={actionLoading} style={{ ...btnBase, flex: 1, background: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error-border)" }}>
                  <Square size={12} fill="currentColor" /> Stop
                </button>
              </div>
            </div>
          )}
        </div>

        {project.status === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {project.deploy_url && (
              <a href={project.deploy_url} target="_blank" rel="noopener noreferrer"
                style={{ ...btnBase, textDecoration: "none", border: "1px solid var(--success-border)", background: "var(--success-bg)", color: "var(--success)", justifyContent: "center" }}>
                <ExternalLink size={12} /> Voir le site
              </a>
            )}
            <button onClick={handleDeploy} disabled={deployLoading}
              style={{ ...btnBase, border: `1px solid ${deployDone ? "var(--success-border)" : "var(--primary-border)"}`, background: deployDone ? "var(--success-bg)" : "var(--primary-muted)", color: deployDone ? "var(--success)" : "var(--accent)", opacity: deployLoading ? 0.7 : 1 }}>
              {deployLoading ? <><Loader2 size={12} className="animate-spin" /> Déploiement…</> :
               deployDone ? <><CheckCircle2 size={12} /> Déployé !</> :
               <><Rocket size={12} /> Publier</>}
            </button>
            <button onClick={handleValidateVisual} disabled={visualLoading}
              style={{ ...btnBase, border: `1px solid ${visualDone ? "var(--success-border)" : "var(--bd-bright)"}`, background: visualDone ? "var(--success-bg)" : "var(--surface2)", color: visualDone ? "var(--success)" : "var(--text2)", opacity: visualLoading ? 0.7 : 1 }}>
              {visualLoading ? <><Loader2 size={12} className="animate-spin" /> Validation…</> :
               visualDone ? <><CheckCircle2 size={12} /> Validé</> :
               <><ScanEye size={12} /> Valider visuellement</>}
            </button>
          </div>
        )}

        {project.status !== "running" && (
          <button onClick={() => setDeleteModal(true)} disabled={actionLoading}
            style={{ ...btnBase, border: "1px solid var(--error-border)", background: "var(--error-bg)", color: "var(--error)", marginTop: "auto" }}>
            <Trash2 size={12} /> Supprimer le projet
          </button>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: isMobile && mobilePanel !== "logs" ? "none" : "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--bd)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--bd)", background: "var(--surface2)", padding: "4px 8px", gap: 2, flexShrink: 0 }}>
          {TABS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "none", background: activeTab === key ? "var(--surface)" : "transparent", color: activeTab === key ? "var(--text)" : "var(--muted)", fontSize: 12, fontWeight: activeTab === key ? 500 : 400, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", boxShadow: activeTab === key ? "0 1px 3px rgba(0,0,0,0.3)" : "none" }}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: 14 }}
            >
              {activeTab === "logs"  && <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}><LogViewer projectId={projectId} /></div>}
              {activeTab === "files" && <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}><FileExplorer projectId={projectId} /></div>}

              {activeTab === "copilot" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4, marginBottom: 10 }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", color: "var(--muted)", gap: 8 }}>
                        <MessageSquare size={22} style={{ opacity: 0.35 }} />
                        <p style={{ fontSize: 13 }}>Posez une question ou demandez une modification.</p>
                      </div>
                    ) : chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: 10, fontSize: 13, background: msg.role === "user" ? "var(--primary)" : "var(--surface2)", color: msg.role === "user" ? "white" : "var(--text2)", border: msg.role === "user" ? "none" : "1px solid var(--bd-bright)", lineHeight: 1.5, borderBottomRightRadius: msg.role === "user" ? 3 : 10, borderBottomLeftRadius: msg.role === "agent" ? 3 : 10 }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{ padding: "8px 12px", borderRadius: 10, borderBottomLeftRadius: 3, background: "var(--surface2)", border: "1px solid var(--bd-bright)", color: "var(--muted)", fontSize: 13 }}>
                          <span className="dot-pulse">…</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                      placeholder="Écrivez votre message…" disabled={chatLoading}
                      style={{ flex: 1, height: 36, padding: "0 11px", borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                      onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
                    />
                    <button onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()}
                      style={{ width: 36, height: 36, borderRadius: 7, border: "none", background: chatInput.trim() ? "var(--primary)" : "var(--surface3)", color: chatInput.trim() ? "white" : "var(--muted)", cursor: chatInput.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "variables" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
                  {envLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />)}
                    </div>
                  ) : Object.keys(envVars).length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", color: "var(--muted)", gap: 8 }}>
                      <KeyRound size={22} style={{ opacity: 0.35 }} />
                      <p style={{ fontSize: 13 }}>Aucune variable. L&apos;agent créera un fichier <code style={{ color: "var(--accent)" }}>.env.example</code> lors de l&apos;initialisation.</p>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5, flexShrink: 0 }}>
                        Ces variables seront écrites dans le fichier <code style={{ color: "var(--accent)", fontFamily: "monospace" }}>.env</code> du projet.
                      </p>
                      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                        {Object.entries(envVars).map(([key, value]) => (
                          <div key={key}>
                            <label style={{ fontSize: 10, fontWeight: 500, color: "var(--accent)", fontFamily: "monospace", display: "block", marginBottom: 4 }}>{key}</label>
                            <input
                              type={key.toLowerCase().includes("secret") || key.toLowerCase().includes("key") || key.toLowerCase().includes("password") ? "password" : "text"}
                              value={value}
                              onChange={(e) => setEnvVars((p) => ({ ...p, [key]: e.target.value }))}
                              style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid var(--bd-bright)", background: "var(--surface2)", color: "var(--text)", fontSize: 12, fontFamily: "monospace", outline: "none" }}
                              onFocus={(e) => { e.target.style.borderColor = "var(--primary)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--bd-bright)"; }}
                              placeholder={`Valeur pour ${key}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={handleSaveEnv} disabled={envLoading}
                          style={{ flex: 1, height: 36, borderRadius: 7, border: envSaved ? "1px solid var(--success-border)" : "none", background: envSaved ? "var(--success-bg)" : "var(--primary)", color: envSaved ? "var(--success)" : "white", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}>
                          {envSaved ? <><CheckCircle2 size={12} /> Enregistré !</> : envLoading ? <><Loader2 size={12} className="animate-spin" /> Sauvegarde…</> : "Enregistrer les variables"}
                        </button>
                        {project.status === "paused" && (
                          <button onClick={handleResume} disabled={actionLoading}
                            style={{ flex: 1, height: 36, borderRadius: 7, border: "1px solid var(--success-border)", background: "var(--success-bg)", color: "var(--success)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}>
                            <Play size={12} fill="currentColor" /> Reprendre
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      </div>
      <Modal
        open={deleteModal}
        title="Supprimer le projet"
        description={`Voulez-vous vraiment supprimer "${project.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </motion.div>
  );
}
