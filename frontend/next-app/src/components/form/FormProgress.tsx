'use client';

interface Step { num: number; label: string; time: string }

export function FormProgress({ steps, current }: { steps: Step[]; current: number }) {
  const remaining = steps
    .slice(current - 1)
    .reduce((acc, s) => acc + parseInt(s.time), 0);

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                transition: 'all 0.3s ease',
                background: s.num < current ? '#fff' : s.num === current ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: s.num < current ? '#0a0a0a' : s.num === current ? '#fff' : 'rgba(255,255,255,0.25)',
                boxShadow: s.num === current ? '0 0 0 3px rgba(255,255,255,0.1)' : 'none',
              }}>
                {s.num < current ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : s.num}
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)',
                    transform: `scaleX(${s.num < current ? 1 : 0})`,
                    transformOrigin: 'left',
                    transition: 'transform 0.5s ease',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
            {steps[current - 1].label}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            ~{remaining} min restantes
          </span>
        </div>
      </div>
    </div>
  );
}
