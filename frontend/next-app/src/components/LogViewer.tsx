"use client";

import { useEffect, useRef, useState } from "react";
import { Log, streamLogs, getLogs } from "@/lib/api";

interface LogViewerProps {
  projectId: number;
  isStreaming?: boolean;
}

export default function LogViewer({ projectId }: LogViewerProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // ─── Détection du scroll utilisateur ───
  // Si l'utilisateur a remonté manuellement, on n'auto-scroll plus
  // tant qu'il n'est pas redescendu en bas.
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = distanceFromBottom < 30; // tolérance 30px
    userScrolledUpRef.current = !isAtBottom;
    setAutoScroll(isAtBottom);
  };

  // ─── Charger l'historique + s'abonner au stream ───
  useEffect(() => {
    let cancelled = false;

    getLogs(projectId)
      .then((existing) => {
        if (cancelled) return;
        const ordered = [...existing].reverse(); // chrono croissant
        setLogs(ordered);
      })
      .catch(() => {
        // pas grave
      });

    setIsConnected(true);
    const unsubscribe = streamLogs(
      projectId,
      (log) => {
        setLogs((prev) => {
          if (prev.some((l) => l.id === log.id)) return prev;
          return [...prev, log];
        });
      },
      () => {
        setIsConnected(false);
      }
    );

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [projectId]);

  // ─── Auto-scroll INTERNE au panneau (jamais la page) ───
  // Modifie uniquement scrollTop du conteneur, pas de scrollIntoView.
  useEffect(() => {
    if (!autoScroll) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs, autoScroll]);

  // ─── Helpers visuels ───
  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      info: "log-info",
      debug: "log-debug",
      warning: "log-warning",
      error: "log-error",
    };
    return colors[level] || "log-info";
  };

  const getLevelIcon = (level: string) => {
    const icons: Record<string, string> = {
      info: "ℹ️",
      debug: "🔍",
      warning: "⚠️",
      error: "❌",
    };
    return icons[level] || "•";
  };

  const scrollToBottomManually = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setAutoScroll(true);
    userScrolledUpRef.current = false;
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="bg-dark-700 px-4 py-3 border-b border-dark-600 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>📋 Logs</span>
          {isConnected && (
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </h3>
        <span className="text-xs text-gray-400">{logs.length} événement(s)</span>
      </div>

      {/* Logs container : auto-scroll INTERNE uniquement */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 relative"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p>En attente de logs...</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={log.id ?? idx} className={`${getLevelColor(log.level)} flex gap-2`}>
              <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
              <span className="text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString("fr-FR")}
              </span>
              <span className="flex-1 break-words">{log.message}</span>
            </div>
          ))
        )}

        {/* Bouton flottant : visible uniquement si l'utilisateur a remonté */}
        {!autoScroll && (
          <button
            onClick={scrollToBottomManually}
            className="sticky bottom-2 ml-auto block px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg"
          >
            ↓ Revenir en bas
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="bg-dark-700 px-4 py-2 border-t border-dark-600 text-xs text-gray-400 flex items-center justify-between">
        <span>
          {isConnected ? (
            <span className="text-green-400">🟢 Connecté</span>
          ) : (
            <span className="text-gray-500">⚫ Déconnecté</span>
          )}
        </span>
        <span className="text-gray-500">
          {autoScroll ? "Suivi auto activé" : "Suivi auto en pause"}
        </span>
      </div>
    </div>
  );
}
