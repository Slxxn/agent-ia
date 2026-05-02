"use client";

import React from "react";

type Status = "idle" | "running" | "paused" | "done" | "error";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

const CONFIG: Record<Status, { label: string; dot: string; style: React.CSSProperties }> = {
  idle: {
    label: "Inactif",
    dot: "var(--muted)",
    style: {
      background: "var(--surface3)",
      color: "var(--muted)",
      border: "1px solid var(--bd-bright)",
    },
  },
  running: {
    label: "En cours",
    dot: "var(--running)",
    style: {
      background: "var(--running-bg)",
      color: "var(--running)",
      border: "1px solid var(--running-border)",
    },
  },
  paused: {
    label: "En pause",
    dot: "var(--warning)",
    style: {
      background: "var(--warning-bg)",
      color: "var(--warning)",
      border: "1px solid var(--warning-border)",
    },
  },
  done: {
    label: "Terminé",
    dot: "var(--success)",
    style: {
      background: "var(--success-bg)",
      color: "var(--success)",
      border: "1px solid var(--success-border)",
    },
  },
  error: {
    label: "Erreur",
    dot: "var(--error)",
    style: {
      background: "var(--error-bg)",
      color: "var(--error)",
      border: "1px solid var(--error-border)",
    },
  },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = CONFIG[status] ?? CONFIG.idle;
  const isRunning = status === "running";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: 6,
        fontWeight: 500,
        whiteSpace: "nowrap",
        fontSize: size === "sm" ? 11 : 12,
        padding: size === "sm" ? "2px 7px" : "3px 9px",
        letterSpacing: "0.01em",
        ...cfg.style,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
        className={isRunning ? "dot-pulse" : ""}
      />
      {cfg.label}
    </span>
  );
}
