'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Zap, Target, Shield, Settings, LogOut, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/app/prospects', label: 'Prospect Hunter',  description: 'Recherche de clients', icon: Target, color: '#F59E0B' },
  { href: '/app/crm',       label: 'CRM',              description: 'Demandes clients',     icon: Users,  color: '#EC4899' },
  { href: '/app/platform',  label: 'Web Platform',     description: 'Génération de sites',  icon: Zap,    color: '#6366F1' },
  { href: '/app/guardian',  label: 'Site Guardian',    description: 'Maintenance des sites', icon: Shield, color: '#10B981' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 56 : 220,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--bd)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          height: 56, padding: '0 14px',
          borderBottom: '1px solid var(--bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <a href="/app/platform" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
              {/* Logo animé 26×26 */}
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px1 3.2s ease-in-out infinite' }}/>
                <rect x="19" y="3" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px2 2.8s ease-in-out infinite' }}/>
                <rect x="35" y="3" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px3 3.5s ease-in-out infinite' }}/>
                <rect x="3" y="19" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px4 2.6s ease-in-out infinite' }}/>
                <rect x="19" y="19" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px5 3.8s ease-in-out infinite' }}/>
                <rect x="35" y="19" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px6 2.9s ease-in-out infinite' }}/>
                <rect x="3" y="35" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px7 3.1s ease-in-out infinite' }}/>
                <rect x="19" y="35" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px8 2.7s ease-in-out infinite' }}/>
                <rect x="35" y="35" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px9 3.4s ease-in-out infinite' }}/>
              </svg>
              <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 14, letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>
                builderz
              </span>
            </a>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{
              marginLeft: collapsed ? 'auto' : undefined,
              width: 26, height: 26, borderRadius: 6,
              border: '1px solid var(--bd-bright)', background: 'var(--surface2)',
              color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: collapsed ? '9px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? 'var(--primary-muted)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; } }}
              >
                <Icon size={15} style={{ flexShrink: 0, color: isActive ? item.color : 'inherit' }} />
                {!collapsed && (
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: isActive ? 'var(--text)' : 'inherit', whiteSpace: 'nowrap' }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted2)', whiteSpace: 'nowrap', marginTop: 1 }}>{item.description}</div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '6px 6px 10px', borderTop: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => router.push('/settings')}
            title={collapsed ? 'Réglages' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '8px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8, border: 'none', background: 'transparent',
              color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
          >
            <Settings size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 12 }}>Réglages</span>}
          </button>
          <button
            onClick={async () => {
              const { signOut } = await import('firebase/auth')
              const { auth } = await import('@/lib/firebase')
              await signOut(auth)
              router.push('/login')
            }}
            title={collapsed ? 'Déconnexion' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '8px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8, border: 'none', background: 'transparent',
              color: 'var(--muted2)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted2)'; }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 12 }}>Déconnexion</span>}
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>

    </div>
  )
}
