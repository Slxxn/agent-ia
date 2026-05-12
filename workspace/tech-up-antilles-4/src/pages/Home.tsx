import { motion } from 'framer-motion';
import Hero from '../components/sections/Hero';
import LogosSection from '../components/sections/LogosSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import ProblemSection from '../components/sections/ProblemSection';
import SolutionSection from '../components/sections/SolutionSection';
import CategoriesSection from '../components/sections/CategoriesSection';
import AboutSection from '../components/sections/AboutSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import PricingSection from '../components/sections/PricingSection';
import InfosSection from '../components/sections/InfosSection';
import CTA from '../components/sections/CTA';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <LogosSection />
      <FeaturesSection />
      <ProblemSection />
      <SolutionSection />
      <CategoriesSection />
      <AboutSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <InfosSection />
      <CTA />
    </motion.div>
  );
};

export default Home;