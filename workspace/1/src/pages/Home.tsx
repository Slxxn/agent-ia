import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import ProductGrid from '../components/ProductGrid';
import TestimonialSection from '../components/TestimonialSection';
import WhatsAppButton from '../components/WhatsAppButton';
import { products } from '../data/products';

const bestSellers = products.filter(p => p.badge === 'best-seller' || p.badge === 'promo').slice(0, 4);

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Best Sellers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Nos meilleures ventes
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            Les produits préférés de nos clients, livrés rapidement en Guadeloupe et Martinique.
          </p>
        </motion.div>

        <ProductGrid products={bestSellers} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
          >
            Voir tout le catalogue
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </section>

      {/* Témoignages */}
      <TestimonialSection />

      {/* CTA WhatsApp Fixe */}
      <WhatsAppButton />
    </main>
  );
};

export default Home;