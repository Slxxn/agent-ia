import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavLink { label: string; href: string; }

export interface NavbarConfig {
  logo: { text: string; imageUrl?: string; };
  links: NavLink[];
  cta?: { label: string; href: string; };
}

export default function Navbar({ config }: { config: NavbarConfig }) {
  const { logo, links, cta } = config;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 0.3s, box-shadow 0.3s',
        background: scrolled ? 'rgba(15,15,18,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bd)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            {logo.imageUrl ? (
              <img src={logo.imageUrl} alt={logo.text} className="h-8 w-auto object-contain" />
            ) : (
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px var(--primary-glow)',
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <circle cx="7" cy="7" r="1.8" fill="white"/>
                </svg>
              </div>
            )}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              {logo.text}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                to={l.href}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: pathname === l.href ? 'var(--text)' : 'var(--muted)',
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: pathname === l.href ? 'var(--surface2)' : 'transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (pathname !== l.href) (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
                onMouseLeave={e => { if (pathname !== l.href) (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            {cta && (
              <Link to={cta.href} className="hidden md:inline-flex btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                {cta.label}
              </Link>
            )}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', color: 'var(--text2)' }}
              onClick={() => setOpen(v => !v)}
              aria-label="Menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--bd)', background: 'rgba(15,15,18,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map(l => (
                <Link
                  key={l.href}
                  to={l.href}
                  style={{
                    fontSize: 15, fontWeight: 500,
                    color: pathname === l.href ? 'var(--text)' : 'var(--text2)',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: pathname === l.href ? 'var(--surface2)' : 'transparent',
                  }}
                >
                  {l.label}
                </Link>
              ))}
              {cta && (
                <Link to={cta.href} className="btn-primary mt-2 justify-center">
                  {cta.label}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
