import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import CategoriesOverview from '../components/home/CategoriesOverview';
import FeaturedProductsSection from '../components/home/FeaturedProductsSection';
import BrandIdentitySection from '../components/home/BrandIdentitySection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import PricingSection from '../components/home/PricingSection';
import { cn } from '../lib/utils';

const Home = () => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#09090B]"
    >
      <HeroSection />
      <CategoriesOverview />
      <FeaturedProductsSection />
      <BrandIdentitySection />
      <TestimonialsSection />
      <PricingSection />
    </motion.main>
  );
};

export default Home;