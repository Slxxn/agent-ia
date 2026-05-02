"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: "default" | "success" | "error" | "warning" | "running";
  subtitle?: string;
}

const COLOR_MAP = {
  default: { bg: "var(--surface2)",    icon: "var(--primary)",  iconBg: "var(--primary-muted)",  text: "var(--text)" },
  success: { bg: "var(--success-bg)",  icon: "var(--success)",  iconBg: "rgba(34,197,94,0.12)",  text: "var(--success)" },
  error:   { bg: "var(--error-bg)",    icon: "var(--error)",    iconBg: "rgba(239,68,68,0.12)",  text: "var(--error)" },
  warning: { bg: "var(--warning-bg)",  icon: "var(--warning)",  iconBg: "rgba(245,158,11,0.12)", text: "var(--warning)" },
  running: { bg: "var(--running-bg)",  icon: "var(--running)",  iconBg: "rgba(59,130,246,0.12)", text: "var(--running)" },
};

export default function StatCard({ label, value, icon, color = "default", subtitle }: StatCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--bd)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: c.text,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: c.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: c.icon,
        }}
      >
        {icon}
      </div>
    </div>
  );
}
