import React from "react";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useCart } from "../stores/cartStore";
import { Button } from "./ui/button";

interface NavbarProps {
  onCartOpen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCartOpen }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-gray-900">
              LuxeShop
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Accueil
            </a>
            <a href="#products" className="text-gray-700 hover:text-gray-900 transition-colors">
              Produits
            </a>
            <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors">
              À propos
            </a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Rechercher">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors" aria-label="Compte">
              <User className="w-5 h-5" />
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2"
              onClick={onCartOpen}
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <a href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              Accueil
            </a>
            <a href="#products" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              Produits
            </a>
            <a href="#about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              À propos
            </a>
            <a href="#contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;