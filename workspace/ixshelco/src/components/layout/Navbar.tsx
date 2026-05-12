import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import AuthModal from '../auth/AuthModal';

const LOGO_URL = 'https://firebasestorage.googleapis.com/v0/b/agent-ia-2d81a.firebasestorage.app/o/logos%2FChatGPT%20Image%202%20mai%202026%2C%2014_38_24.png?alt=media&token=7426abf5-097b-4e2b-a403-605e95a0c511';

interface NavLink {
  label: string;
  href?: string;
  hash?: string;
}

const navLinks: NavLink[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Prestations', hash: 'services' },
  { label: 'Galerie', hash: 'gallery' },
  { label: 'Tarifs', hash: 'pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleNavClick = (link: NavLink) => {
    setIsOpen(false);
    if (link.hash) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(link.hash!)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(link.hash)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderLink = (link: NavLink, mobile = false) => {
    const baseClass = mobile
      ? 'block text-base font-medium transition-colors duration-200'
      : 'text-sm font-medium transition-colors duration-200';
    const activeClass = 'text-[var(--primary)]';
    const inactiveClass = 'text-[var(--muted)] hover:text-[var(--text)]';
    const isActive = link.href ? location.pathname === link.href : false;

    if (link.hash) {
      return (
        <button
          key={link.label}
          onClick={() => handleNavClick(link)}
          className={cn(baseClass, inactiveClass)}
        >
          {link.label}
        </button>
      );
    }

    return (
      <Link
        key={link.label}
        to={link.href!}
        className={cn(baseClass, isActive ? activeClass : inactiveClass)}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[var(--bg)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2"
            >
              {LOGO_URL ? (
                <img src={LOGO_URL} alt="IXSHEL&CO" className="h-20 w-auto object-contain drop-shadow-sm" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
                    IXSHEL&CO
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => renderLink(link))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    Mon compte
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  Connexion
                </button>
              )}

              <Link
                to="/booking"
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
              >
                Réserver
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => renderLink(link, true))}

                <div className="pt-4 border-t border-[var(--border)] space-y-3">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block text-base font-medium text-[var(--muted)] hover:text-[var(--text)]"
                      >
                        Mon compte
                      </Link>
                      <button
                        onClick={logout}
                        className="block text-base font-medium text-[var(--muted)] hover:text-[var(--text)]"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowAuthModal(true); setIsOpen(false); }}
                      className="block text-base font-medium text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      Connexion
                    </button>
                  )}

                  <Link
                    to="/booking"
                    className="block text-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Réserver maintenant
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navbar;
