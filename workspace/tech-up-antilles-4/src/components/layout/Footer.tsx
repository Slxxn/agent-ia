import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--text)]">TECH-UP</span>
                <span className="text-lg font-bold text-[var(--accent)]"> Antilles</span>
              </div>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
              Votre boutique spécialisée en accessoires mobiles à Fort-de-France. 
              Coques, chargeurs, écouteurs et bien plus au meilleur prix en Martinique.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/techup_antilles"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/techupantilles"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/596696053363"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-green-500 hover:border-green-500/30 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-4">
              Liens rapides
            </h3>
            <ul className="space-y-3">
              {['Produits', 'Catégories', 'À propos', 'Avis clients', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, '')}`}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-4">
              Catégories
            </h3>
            <ul className="space-y-3">
              {['Coques', 'Chargeurs', 'Écouteurs', 'Protections', 'Accessoires'].map((cat) => (
                <li key={cat}>
                  <a
                    href={`#categories`}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com/?q=93+Rue+Victor+Hugo+97200+Fort-de-France"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>93 Rue Victor Hugo<br />97200 Fort-de-France</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+596696053363"
                  className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+596 696 05 33 63</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@techup-antilles.com"
                  className="flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>contact@techup-antilles.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-[var(--muted)]">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>Lun–Ven : 9h–18h</p>
                  <p>Sam : 9h–14h</p>
                  <p>Dim : Fermé</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              © {currentYear} TECH-UP Antilles. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Ouvert aujourd'hui
              </span>
              <a
                href="https://wa.me/596696053363"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--accent)] hover:text-[var(--accent2)] transition-colors"
              >
                Commander sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;