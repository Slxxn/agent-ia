import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp, FaFacebookF, FaTwitter } from 'react-icons/fa';

const navigation = {
  produits: [
    { name: 'Smartphones', href: '/products?category=smartphone' },
    { name: 'Accessoires', href: '/products?category=accessoires' },
    { name: 'Promotions', href: '/products?badge=promo' },
    { name: 'Best Sellers', href: '/products?badge=best-seller' },
  ],
  entreprise: [
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Livraison', href: '/faq#livraison' },
  ],
  legal: [
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'CGV', href: '/cgv' },
    { name: 'Politique de confidentialité', href: '/confidentialite' },
  ],
};

export const Footer: React.FC = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Bonjour, j\'ai une question concernant votre boutique TechUp Antilles.');
    window.open(`https://wa.me/590690000000?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-[#0B0B0B] border-t border-[#7C3AED]/20 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TA</span>
              </div>
              <span className="text-white font-bold text-lg">
                TechUp <span className="text-[#06B6D4]">Antilles</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre boutique tech premium en Guadeloupe et Martinique. Smartphones reconditionnés,
              accessoires et gadgets high-tech livrés rapidement chez vous. Service client réactif
              via WhatsApp.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="https://instagram.com/techupantilles" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-500 hover:bg-pink-500/10 transition-all">
                <FaInstagram className="w-4 h-4" />
              </a>
              <button onClick={handleWhatsApp} className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all">
                <FaWhatsapp className="w-4 h-4" />
              </button>
              <a href="https://facebook.com/techupantilles" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-600/10 transition-all">
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/techupantilles" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-sky-500 hover:bg-sky-500/10 transition-all">
                <FaTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produits</h3>
            <ul className="space-y-2">
              {navigation.produits.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-400 hover:text-[#06B6D4] text-sm transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {navigation.entreprise.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-400 hover:text-[#06B6D4] text-sm transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-400 hover:text-[#06B6D4] text-sm transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Séparation */}
        <div className="border-t border-[#7C3AED]/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} TechUp Antilles. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-xs mt-2 md:mt-0">
            Site réalisé avec ❤️ en Guadeloupe
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;