"use client";

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--bd)",
        borderRadius: 12,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="skeleton" style={{ height: 13, width: "55%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 20, width: 64, borderRadius: 6 }} />
      </div>
      {/* Description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="skeleton" style={{ height: 11, width: "80%", borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: "60%", borderRadius: 4 }} />
      </div>
      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div className="skeleton" style={{ height: 10, width: 70, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 10, width: 30, borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ height: 5, width: "100%", borderRadius: 99 }} />
      </div>
      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ height: 10, width: 90, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 28, width: 56, borderRadius: 7 }} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 16px",
        borderBottom: "1px solid var(--bd)",
      }}
    >
      <div className="skeleton" style={{ height: 13, width: "28%", borderRadius: 5 }} />
      <div className="skeleton" style={{ height: 20, width: 70, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 5, width: "100%", borderRadius: 99 }} />
      </div>
      <div className="skeleton" style={{ height: 11, width: 80, borderRadius: 4, flexShrink: 0 }} />
      <div className="skeleton" style={{ height: 28, width: 54, borderRadius: 7, flexShrink: 0 }} />
    </div>
  );
}

export function SkeletonStat() {
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
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 26, width: 40, borderRadius: 6 }} />
      </div>
      <div className="skeleton" style={{ height: 40, width: 40, borderRadius: 10 }} />
    </div>
  );
}
