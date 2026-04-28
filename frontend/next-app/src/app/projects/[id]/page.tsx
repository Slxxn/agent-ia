"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LogViewer from "@/components/LogViewer";
import FileExplorer from "@/components/FileExplorer";
import {
  Project,
  getProject,
  startProject,
  stopProject,
  pauseProject,
  resumeProject,
  deleteProject,
  streamProject,
  sendChatMessage,
  getProjectEnv,
  updateProjectEnv,
} from "@/lib/api";

type Tab = "logs" | "files" | "copilot" | "variables";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objective, setObjective] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("logs");

  // Chatbot
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Variables
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [envLoading, setEnvLoading] = useState(false);
  const [envSaved, setEnvSaved] = useState(false);

  // ── Stream SSE + polling de secours ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    getProject(projectId)
      .then((data) => { if (!cancelled) { setProject(data); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    const unsubscribe = streamProject(projectId, (data) => {
      setProject(data);
      setError(null);
    });

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [projectId]);

  // Polling de secours toutes les 3s si le projet tourne
  useEffect(() => {
    if (!project || project.status !== "running") return;
    const interval = setInterval(async () => {
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [project?.status, projectId]);

  // Charger les variables quand on ouvre l'onglet
  useEffect(() => {
    if (activeTab !== "variables") return;
    setEnvLoading(true);
    getProjectEnv(projectId)
      .then((data) => setEnvVars(data))
      .catch(() => {})
      .finally(() => setEnvLoading(false));
  }, [activeTab, projectId]);

  // Scroll automatique du chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!objective.trim()) { alert("Veuillez entrer un objectif"); return; }
    try {
      setActionLoading(true);
      await startProject(projectId, objective);
      setObjective("");
      const data = await getProject(projectId);
      setProject(data);
    } catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleStop = async () => {
    try { setActionLoading(true); await stopProject(projectId); const data = await getProject(projectId); setProject(data); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handlePause = async () => {
    try { setActionLoading(true); await pauseProject(projectId); const data = await getProject(projectId); setProject(data); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleResume = async () => {
    try { setActionLoading(true); await resumeProject(projectId); const data = await getProject(projectId); setProject(data); }
    catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer le projet "${project?.name}" ? Cette action est irréversible.`)) return;
    try {
      setActionLoading(true);
      await deleteProject(projectId);
      router.push("/");
    } catch (err) { alert(err instanceof Error ? err.message : "Erreur"); }
    finally { setActionLoading(false); }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);
    try {
      const res = await sendChatMessage(projectId, userMsg);
      setChatMessages((prev) => [...prev, { role: "agent", text: res.message || "Message reçu par l'agent." }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "agent", text: "❌ Erreur lors de l'envoi du message." }]);
    } finally { setChatLoading(false); }
  };

  const handleSaveEnv = async () => {
    try {
      setEnvLoading(true);
      await updateProjectEnv(projectId, envVars);
      setEnvSaved(true);
      setTimeout(() => setEnvSaved(false), 3000);
    } catch { alert("Erreur lors de la sauvegarde des variables."); }
    finally { setEnvLoading(false); }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const statusColors: Record<string, string> = {
    idle: "status-idle", running: "status-running", paused: "status-paused",
    done: "status-done", error: "status-error",
  };
  const statusLabels: Record<string, string> = {
    idle: "Inactif", running: "En cours", paused: "En pause",
    done: "Terminé", error: "Erreur",
  };

  const progressColor = project?.status === "error"
    ? "from-red-500 to-red-600"
    : project?.status === "done"
    ? "from-green-500 to-green-600"
    : "from-blue-500 to-blue-600";

  if (loading) {
    return <div className="text-center py-12 text-gray-400"><p>Chargement du projet...</p></div>;
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">← Retour aux projets</Link>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300">
          <p>Erreur : {error || "Projet non trouvé"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-3 text-sm">
            ← Retour aux projets
          </Link>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="text-gray-400 mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`status-badge ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
          {project.status !== "running" && (
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-300 text-sm rounded-lg transition-colors"
              title="Supprimer le projet"
            >
              🗑 Supprimer
            </button>
          )}
        </div>
      </div>

      {/* Barre de progression animée */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Progression</h3>
          <span className="text-2xl font-bold text-blue-400">{Math.round(project.progress)}%</span>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden relative">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out relative`}
            style={{ width: `${project.progress}%` }}
          >
            {project.status === "running" && (
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite linear",
                }}
              />
            )}
          </div>
        </div>
        {/* Animation shimmer CSS inline */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>

      {/* Panneau de contrôle */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Contrôle</h3>

        {project.status === "idle" && (
          <div className="space-y-3">
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Décrivez l'objectif du projet..."
              rows={3}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
            />
            <button
              onClick={handleStart}
              disabled={actionLoading || !objective.trim()}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {actionLoading ? "Démarrage..." : "▶ Démarrer le projet"}
            </button>
          </div>
        )}

        {project.status === "running" && (
          <div className="flex gap-3">
            <button onClick={handlePause} disabled={actionLoading}
              className="flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm">
              {actionLoading ? "..." : "⏸ Pause"}
            </button>
            <button onClick={handleStop} disabled={actionLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm">
              {actionLoading ? "..." : "⏹ Arrêter"}
            </button>
          </div>
        )}

        {project.status === "paused" && (
          <div className="space-y-3">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 text-yellow-300 text-sm">
              ⚠️ Projet en pause. Remplissez les variables dans l'onglet "Variables" si nécessaire, puis reprenez.
            </div>
            <div className="flex gap-3">
              <button onClick={handleResume} disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm">
                {actionLoading ? "..." : "▶ Reprendre"}
              </button>
              <button onClick={handleStop} disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm">
                {actionLoading ? "..." : "⏹ Arrêter"}
              </button>
            </div>
          </div>
        )}

        {(project.status === "done" || project.status === "error") && (
          <div className="space-y-3">
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Nouvel objectif ou modification..."
              rows={2}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
            />
            <button
              onClick={handleStart}
              disabled={actionLoading || !objective.trim()}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {actionLoading ? "..." : project.status === "error" ? "🔄 Réessayer" : "🔄 Recommencer"}
            </button>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
        <div className="flex border-b border-dark-700">
          {(["logs", "files", "copilot", "variables"] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = {
              logs: "📋 Logs",
              files: "📁 Fichiers",
              copilot: "🤖 Copilote",
              variables: "🔑 Variables",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-dark-700 text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-gray-200 hover:bg-dark-750"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {activeTab === "logs" && <LogViewer projectId={projectId} />}

          {activeTab === "files" && <FileExplorer projectId={projectId} />}

          {/* Copilote Chatbot */}
          {activeTab === "copilot" && (
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                {chatMessages.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Posez une question ou demandez une modification à l'agent...
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-dark-700 text-gray-200 rounded-bl-sm border border-dark-600"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-dark-700 border border-dark-600 text-gray-400 px-4 py-2 rounded-xl rounded-bl-sm text-sm">
                      <span className="animate-pulse">L'agent réfléchit...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleSendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}

          {/* Variables d'environnement */}
          {activeTab === "variables" && (
            <div className="space-y-4">
              {envLoading ? (
                <p className="text-gray-400 text-sm text-center py-8">Chargement des variables...</p>
              ) : Object.keys(envVars).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  Aucune variable détectée. L'agent créera un fichier .env.example lors de l'initialisation du projet.
                </p>
              ) : (
                <>
                  <p className="text-gray-400 text-xs">
                    Ces variables seront écrites dans le fichier <code className="text-blue-400">.env</code> du projet.
                  </p>
                  <div className="space-y-3">
                    {Object.entries(envVars).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-mono text-blue-300">{key}</label>
                        <input
                          type={key.toLowerCase().includes("secret") || key.toLowerCase().includes("key") ? "password" : "text"}
                          value={value}
                          onChange={(e) => setEnvVars((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                          placeholder={`Valeur pour ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveEnv}
                    disabled={envLoading}
                    className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-colors text-sm ${
                      envSaved
                        ? "bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {envSaved ? "✅ Variables enregistrées !" : envLoading ? "Sauvegarde..." : "💾 Enregistrer les variables"}
                  </button>
                  {project.status === "paused" && (
                    <button
                      onClick={handleResume}
                      disabled={actionLoading}
                      className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      ▶ Enregistrer et Reprendre le projet
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Métadonnées */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-xs text-gray-500">
        Créé le {new Date(project.created_at).toLocaleString("fr-FR")} • Modifié le{" "}
        {new Date(project.updated_at).toLocaleString("fr-FR")}
      </div>
    </div>
  );
}
