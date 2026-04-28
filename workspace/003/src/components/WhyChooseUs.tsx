import React from "react";
import { motion } from "framer-motion";
import { Shield, Truck, RefreshCw, Headphones } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Transactions 100% sécurisées avec chiffrement SSL.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    description: "Expédition sous 24h et livraison en 2-5 jours ouvrés.",
  },
  {
    icon: RefreshCw,
    title: "Retours gratuits",
    description: "Satisfait ou remboursé sous 30 jours sans frais.",
  },
  {
    icon: Headphones,
    title: "Service client 24/7",
    description: "Une équipe dédiée à votre écoute, jour et nuit.",
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous nous engageons à vous offrir la meilleure expérience d&apos;achat.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="p-3 bg-purple-100 rounded-full mb-4">
                <reason.icon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {reason.title}
              </h3>
              <p className="text-gray-600">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;