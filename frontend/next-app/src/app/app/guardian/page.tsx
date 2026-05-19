export default function GuardianPage() {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{
          width: 64, height: 64,
          background: 'var(--surface2)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 24px',
          border: '1px solid var(--bd-bright)',
        }}>
          🛡️
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
          Site Guardian
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20 }}>
          Surveillance automatique, maintenance et rapports
          mensuels pour tous vos sites clients.
          Fonctionnalités en cours de déploiement.
        </p>
        <div style={{
          display: 'inline-block',
          background: 'var(--surface2)',
          color: 'var(--muted2)',
          fontSize: 11, fontWeight: 500,
          padding: '5px 12px',
          borderRadius: 99,
          border: '1px solid var(--bd-bright)',
        }}>
          Bientôt disponible
        </div>
      </div>
    </div>
  )
}
