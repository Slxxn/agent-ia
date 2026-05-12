import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Prestations', href: '/#services' },
    { label: 'Tarifs', href: '/#pricing' },
    { label: 'Galerie', href: '/#gallery' },
    { label: 'Réservation', href: '/booking' },
  ],
  company: [
    { label: 'À propos', href: '/#about' },
    { label: 'Blog', href: '/#blog' },
    { label: 'Carrières', href: '/#careers' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Guide des soins', href: '/#guide' },
    { label: 'Conditions', href: '/#terms' },
    { label: 'Politique de confidentialité', href: '/#privacy' },
  ],
  legal: [
    { label: 'Mentions légales', href: '/#legal' },
    { label: 'CGV', href: '/#cgv' },
    { label: 'Politique cookies', href: '/#cookies' },
  ],
};

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4"
            >
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">
                IXSHEL&CO
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
              Votre institut de beauté premium à Paris. Des soins sur mesure pour
              révéler votre éclat naturel.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all duration-200"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all duration-200"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all duration-200"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-4">
              Prestations
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-4">
              Société
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-4">
              Ressources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">15 Rue de la Beauté</p>
              <p className="text-sm text-[var(--muted)]">75001 Paris</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">01 23 45 67 89</p>
              <p className="text-sm text-[var(--muted)]">Lun-Sam 9h-19h</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">contact@ixshelco.fr</p>
              <p className="text-sm text-[var(--muted)]">Réponse sous 24h</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} IXSHEL&CO. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-[var(--muted)]">Ouvert aujourd'hui</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;