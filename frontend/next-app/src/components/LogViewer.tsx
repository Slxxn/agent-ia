"use client";

import { useEffect, useRef, useState } from "react";
import { Log, streamLogs, getLogs } from "@/lib/api";

interface LogViewerProps {
  projectId: number;
}

const LEVEL_COLOR: Record<string, string> = {
  info:    "var(--text2)",
  debug:   "var(--muted)",
  warning: "var(--warning)",
  error:   "var(--error)",
};

const LEVEL_DOT: Record<string, string> = {
  info:    "var(--accent)",
  debug:   "var(--muted)",
  warning: "var(--warning)",
  error:   "var(--error)",
};

const LEVEL_LABEL: Record<string, string> = {
  info: "i", debug: "d", warning: "!", error: "x",
};

export default function LogViewer({ projectId }: LogViewerProps) {
  const [logs,        setLogs]        = useState<Log[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll,  setAutoScroll]  = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  };

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;
    const init = async () => {
      let maxId = 0;
      try {
        const existing = await getLogs(projectId);
        if (cancelled) return;
        const ordered = [...existing].reverse();
        setLogs(ordered);
        maxId = ordered.reduce((m, l) => Math.max(m, l.id ?? 0), 0);
      } catch {}
      if (cancelled) return;
      setIsConnected(true);
      unsub = streamLogs(projectId, (log) => {
        setLogs((prev) => {
          if (prev.some((l) => l.id === log.id)) return prev;
          return [...prev, log];
        });
      }, () => setIsConnected(false), maxId);
    };
    init();
    return () => { cancelled = true; unsub?.(); };
  }, [projectId]);

  useEffect(() => {
    if (!autoScroll) return;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs, autoScroll]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid var(--bd)", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
          Logs
          {isConnected && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />}
        </span>
        <span style={{ fontSize: 10, color: "var(--muted2)" }}>{logs.length} événements</span>
      </div>

      <div ref={containerRef} onScroll={handleScroll}
        style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
        {logs.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--muted2)", fontSize: 12 }}>
            En attente de logs…
          </div>
        ) : logs.map((log, idx) => (
          <div key={log.id ?? idx} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12, lineHeight: 1.5, color: LEVEL_COLOR[log.level] || "var(--text2)" }}>
            <span style={{ flexShrink: 0, width: 14, height: 14, borderRadius: 3, background: LEVEL_DOT[log.level] || "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", marginTop: 1 }}>
              {LEVEL_LABEL[log.level] || "i"}
            </span>
            <span style={{ flexShrink: 0, color: "var(--muted2)", fontSize: 11, fontVariantNumeric: "tabular-nums", marginTop: 1 }}>
              {new Date(log.timestamp).toLocaleTimeString("fr-FR")}
            </span>
            <span style={{ flex: 1, wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {log.message}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", borderTop: "1px solid var(--bd)", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: isConnected ? "var(--success)" : "var(--muted2)" }}>
          {isConnected ? "Connecté" : "Déconnecté"}
        </span>
        {!autoScroll && (
          <button onClick={() => { const el = containerRef.current; if (el) el.scrollTop = el.scrollHeight; setAutoScroll(true); }}
            type="button"
            style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontFamily: "inherit" }}>
            Bas
          </button>
        )}
        <span style={{ fontSize: 10, color: "var(--muted2)" }}>
          {autoScroll ? "Suivi auto" : "En pause"}
        </span>
      </div>
    </div>
  );
}
