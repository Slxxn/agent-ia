import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Facebook, Twitter, Instagram, Github } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Fonctionnalités', path: '#' },
    { name: 'Tarifs', path: '#' },
    { name: 'API', path: '#' },
    { name: 'Intégrations', path: '#' },
  ],
  Company: [
    { name: 'À propos', path: '/about' },
    { name: 'Carrières', path: '#' },
    { name: 'Blog', path: '#' },
    { name: 'Presse', path: '#' },
  ],
  Resources: [
    { name: 'Documentation', path: '#' },
    { name: 'Support', path: '/contact' },
    { name: 'Statut', path: '#' },
    { name: 'Communauté', path: '#' },
  ],
  Legal: [
    { name: 'Confidentialité', path: '#' },
    { name: 'Conditions', path: '#' },
    { name: 'CO2', path: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-violet-400" />
              <span className="text-lg font-bold">TechUp</span>
            </Link>
            <p className="text-muted text-sm max-w-xs mb-6">
              Votre destination premium pour le matériel tech aux Antilles. Livraison rapide, service client exceptionnel.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">© 2024 TechUp Antilles. Tous droits réservés.</p>
          <div className="flex items-center gap-1 text-sm text-muted">
            <span>Fait avec</span>
            <span className="text-red-400">♥</span>
            <span>aux Antilles</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
