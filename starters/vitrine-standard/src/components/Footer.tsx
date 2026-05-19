import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-default)] py-12">
      <div className="max-w-[var(--container-max)] mx-auto px-[var(--section-padding-x)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[var(--text-muted)] text-sm">
            {/* BUSINESS_NAME + YEAR */}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/mentions-legales" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm transition-colors">
              Mentions légales
            </Link>
            {/* FOOTER_LINKS */}
          </div>
        </div>
      </div>
    </footer>
  )
}
