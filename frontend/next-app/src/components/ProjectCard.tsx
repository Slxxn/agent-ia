"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trash2, MoreHorizontal, ExternalLink, FolderOpen, Copy, Check, Bot } from "lucide-react";
import { Project, prepareWorkspace, generateClaudePrompt } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
  index?: number;
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const color =
    status === "error"  ? "var(--error)"
    : status === "done"   ? "var(--success)"
    : status === "paused" ? "var(--warning)"
    : "var(--running)";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 7,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
          Progression
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color, letterSpacing: "-0.01em" }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 4,
          background: "var(--surface3)",
          borderRadius: 99,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: color,
            borderRadius: 99,
            transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {status === "running" && (
            <span className="progress-shimmer" style={{ position: "absolute", inset: 0 }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard({ project, onDelete, index = 0 }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [preparingWorkspace, setPreparingWorkspace] = useState(false);
  const [copyingPrompt, setCopyingPrompt] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [launchingAgent, setLaunchingAgent] = useState(false);

  const handleCopyPrompt = async () => {
    setCopyingPrompt(true);
    try {
      const { prompt } = await generateClaudePrompt(project.id);
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 3000);
    } catch {
      alert("❌ Erreur lors de la génération du prompt. Le projet doit avoir un brief JSON.");
    } finally {
      setCopyingPrompt(false);
    }
  };

  const handleLaunchAgent = async () => {
    if (!confirm("Lancer la génération automatique avec Gemini + DeepSeek ?")) return;
    setLaunchingAgent(true);
    try {
      await fetch(`/api/projects/${project.id}/start`, { method: "POST" });
    } catch {
      alert("❌ Erreur lors du lancement de l'agent.");
    } finally {
      setLaunchingAgent(false);
    }
  };

  const handlePrepareWorkspace = async () => {
    setMenuOpen(false);
    setPreparingWorkspace(true);
    try {
      const { workspace } = await prepareWorkspace(project.id);
      alert(`✅ Workspace prêt : ${workspace}\n\nDis à Claude Code :\n"Lis ${workspace}/brief.md et génère le site complet"`);
    } catch {
      alert("❌ Erreur lors de la préparation du workspace. Le projet doit avoir un brief JSON.");
    } finally {
      setPreparingWorkspace(false);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteModalOpen(false);
    onDelete?.(project.id);
  };

  const canDelete = project.status !== "running";

  const createdAt = new Date(project.created_at);
  const diffDays = Math.floor((Date.now() - createdAt.getTime()) / 86400000);
  const dateLabel =
    diffDays === 0 ? "Aujourd'hui"
    : diffDays === 1 ? "Hier"
    : diffDays < 7 ? `Il y a ${diffDays} j`
    : createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--bd)",
          borderRadius: 12,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
        }}
        className="group"
      >
        {/* ── Top: status badge + client/test badge + overflow menu ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusBadge status={project.status as any} />
            {project.generation_mode === "manual" ? (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)" }}>
                Manuel
              </span>
            ) : project.generation_mode === "agent" ? (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}>
                Agent
              </span>
            ) : null}
            {project.is_client ? (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>
                Client
              </span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 99, background: "var(--surface3)", color: "var(--muted2)", border: "1px solid var(--bd-bright)" }}>
                Test
              </span>
            )}
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                border: "1px solid transparent",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.background = "var(--surface3)";
                btn.style.borderColor = "var(--bd-bright)";
                btn.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.background = "transparent";
                btn.style.borderColor = "transparent";
                btn.style.color = "var(--muted)";
              }}
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 10 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 4px)",
                    background: "var(--surface2)",
                    border: "1px solid var(--bd-bright)",
                    borderRadius: 9,
                    padding: "4px",
                    minWidth: 140,
                    zIndex: 20,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}
                >
                  <Link href={`/project?id=${project.id}`} style={{ textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 10px", borderRadius: 6,
                        color: "var(--text2)", fontSize: 13, cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface3)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <ArrowRight size={13} />
                      Ouvrir
                    </div>
                  </Link>
                  <div
                    onClick={handlePrepareWorkspace}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 10px", borderRadius: 6,
                      color: preparingWorkspace ? "var(--muted)" : "var(--text2)", fontSize: 13, cursor: preparingWorkspace ? "default" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!preparingWorkspace) (e.currentTarget as HTMLElement).style.background = "var(--surface3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <FolderOpen size={13} />
                    {preparingWorkspace ? "Préparation…" : "Préparer workspace"}
                  </div>
                  {canDelete && (
                    <div
                      onClick={() => { setMenuOpen(false); setDeleteModalOpen(true); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 10px", borderRadius: 6,
                        color: "var(--error)", fontSize: 13, cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--error-bg)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Trash2 size={13} />
                      Supprimer
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Name + description ── */}
        <div>
          <Link href={`/project?id=${project.id}`} style={{ textDecoration: "none" }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                letterSpacing: "-0.01em",
                lineHeight: 1.35,
                marginBottom: project.description ? 4 : 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text)"; }}
            >
              {project.name}
            </h3>
          </Link>
          {project.description && (
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {project.description}
            </p>
          )}
        </div>

        {/* ── Progress bar ── */}
        <ProgressBar progress={project.progress} status={project.status} />

        {/* ── Deploy URL ── */}
        {project.deploy_url && (
          <a
            href={project.deploy_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 500,
              color: "var(--success)",
              textDecoration: "none",
              background: "var(--success-bg)",
              border: "1px solid var(--success-border)",
              borderRadius: 6,
              padding: "4px 8px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            <ExternalLink size={10} style={{ flexShrink: 0 }} />
            {project.deploy_url.replace("https://", "")}
          </a>
        )}

        {/* ── Dual-mode generation buttons (only if brief present and not running) ── */}
        {project.brief && project.status !== "running" && (
          <div style={{ display: "flex", gap: 6, borderTop: "1px solid var(--bd)", paddingTop: 12 }}>
            <button
              onClick={handleCopyPrompt}
              disabled={copyingPrompt}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "6px 10px", borderRadius: 7, border: "1px solid", fontSize: 11, fontWeight: 500,
                cursor: copyingPrompt ? "default" : "pointer", transition: "all 0.15s",
                background: promptCopied ? "rgba(16,185,129,0.08)" : "rgba(139,92,246,0.08)",
                color: promptCopied ? "var(--success)" : "#8B5CF6",
                borderColor: promptCopied ? "rgba(16,185,129,0.2)" : "rgba(139,92,246,0.2)",
                opacity: copyingPrompt ? 0.6 : 1,
              }}
            >
              {promptCopied ? <Check size={11} /> : copyingPrompt ? null : <Copy size={11} />}
              {promptCopied ? "Copié !" : copyingPrompt ? "Génération…" : "Prompt Claude"}
            </button>
            <button
              onClick={handleLaunchAgent}
              disabled={launchingAgent}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                padding: "6px 10px", borderRadius: 7, border: "1px solid rgba(59,130,246,0.2)", fontSize: 11, fontWeight: 500,
                cursor: launchingAgent ? "default" : "pointer", transition: "all 0.15s",
                background: "rgba(59,130,246,0.08)", color: "#3B82F6", opacity: launchingAgent ? 0.6 : 1,
              }}
            >
              <Bot size={11} />
              {launchingAgent ? "Lancement…" : "Agent auto"}
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 6,
            borderTop: "1px solid var(--bd)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--muted2)" }}>{dateLabel}</span>
          <Link
            href={`/project?id=${project.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 500,
              color: "var(--accent)",
              textDecoration: "none",
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--primary-muted)";
              el.style.borderColor = "var(--primary-border)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.borderColor = "transparent";
            }}
          >
            Voir <ArrowRight size={11} />
          </Link>
        </div>
      </motion.div>

      <Modal
        open={deleteModalOpen}
        title="Supprimer le projet"
        description={`Voulez-vous vraiment supprimer "${project.name}" ? Cette action est irréversible et supprimera tous les fichiers générés.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
