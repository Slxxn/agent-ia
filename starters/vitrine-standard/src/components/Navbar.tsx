import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

// NAV_ITEMS — sera remplacé par Claude Code selon les pages du brief
const NAV_ITEMS: { label: string; href: string }[] = []

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--section-padding-x)] h-16 flex items-center justify-between">

        <Link to="/" className="text-[var(--text-primary)] font-bold text-xl">
          {/* BUSINESS_NAME */}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm transition-colors ${
                pathname === item.href
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* CTA_BUTTON — sera personnalisé */}
          <button
            className="md:hidden text-[var(--text-secondary)]"
            onClick={() => setOpen(!open)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

      </div>

      {open && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-t border-[var(--border-default)] px-6 py-4 space-y-3">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
