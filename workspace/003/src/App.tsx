import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { WhyChooseUs } from './components/WhyChooseUs';
import { SocialSection } from './components/SocialSection';
import { ReviewsSlider } from './components/ReviewsSlider';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider } from './stores/cartStore';

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#0B0B0B] text-white overflow-hidden">
        <Navbar onCartOpen={() => setCartOpen(true)} />
        <main>
          <HeroSection />
          <FeaturedProducts />
          <WhyChooseUs />
          <SocialSection />
          <ReviewsSlider />
        </main>
        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  );
}

export default App;
