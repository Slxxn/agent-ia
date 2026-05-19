'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { Zap, Target, Shield, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    href: '/app/platform',
    label: 'Web Platform',
    description: 'Génération de sites',
    icon: Zap,
    color: '#6366F1',
  },
  {
    href: '/app/prospects',
    label: 'Prospect Hunter',
    description: 'Recherche de clients',
    icon: Target,
    color: '#F59E0B',
  },
  {
    href: '/app/guardian',
    label: 'Site Guardian',
    description: 'Maintenance des sites',
    icon: Shield,
    color: '#10B981',
  },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (!user) {
    router.replace('/login')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

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
          height: 56,
          padding: '0 14px',
          borderBottom: '1px solid var(--bd)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {!collapsed && (
            <a href="/app/platform" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26,
                background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 14px rgba(99,102,241,0.3)',
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                  <circle cx="7" cy="7" r="1.8" fill="white"/>
                </svg>
              </div>
              <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13, letterSpacing: '-0.015em', whiteSpace: 'nowrap' }}>
                builderz
              </span>
            </a>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{
              marginLeft: collapsed ? 'auto' : undefined,
              width: 26, height: 26,
              borderRadius: 6,
              border: '1px solid var(--bd-bright)',
              background: 'var(--surface2)',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
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
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '9px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary-muted)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
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
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '8px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
          >
            <Settings size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 12 }}>Réglages</span>}
          </button>
          <button
            onClick={() => signOut(auth).then(() => router.push('/login'))}
            title={collapsed ? 'Déconnexion' : undefined}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '9px 0' : '8px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 8, border: 'none',
              background: 'transparent', color: 'var(--muted2)',
              cursor: 'pointer', transition: 'all 0.15s',
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
