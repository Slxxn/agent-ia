import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Banner from './components/Banner';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedProducts from './components/FeaturedProducts';
import WhyChooseUs from './components/WhyChooseUs';
import SocialMedia from './components/SocialMedia';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import CartModal from './components/CartModal';

export const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#0B0B0B] text-white">
        {/* Bannière info locale */}
        <Banner />

        {/* Barre de navigation avec bouton panier */}
        <Navbar onCartClick={openCart} />

        {/* Section héro */}
        <HeroSection />

        {/* Produits en vedette */}
        <FeaturedProducts />

        {/* Pourquoi nous choisir */}
        <WhyChooseUs />

        {/* Réseaux sociaux */}
        <SocialMedia />

        {/* Avis clients */}
        <Testimonials />

        {/* Footer complet */}
        <Footer />

        {/* Modale du panier */}
        {isCartOpen && <CartModal onClose={closeCart} />}
      </div>
    </CartProvider>
  );
};

export default App;