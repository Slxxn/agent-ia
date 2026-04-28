import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Instagram } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';

const Contact: React.FC = () => {
  const whatsappNumber = '+590690000000'; // Exemple : remplacer par le vrai numéro
  const instagramUrl = 'https://www.instagram.com/techupantilles/';

  const contactInfo = [
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+590 690 00 00 00',
      href: 'tel:+590690000000',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@techup-antilles.com',
      href: 'mailto:contact@techup-antilles.com',
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Pointe-à-Pitre, Guadeloupe',
      href: 'https://maps.google.com/?q=Pointe-à-Pitre+Guadeloupe',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-gray-400 mb-12">
            Une question, un besoin ? Notre équipe est à votre écoute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Coordonnées */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#7C3AED]/50 transition-all group"
              >
                <div className="p-2 bg-[#7C3AED]/20 rounded-lg">
                  <item.icon className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-white font-medium group-hover:text-[#06B6D4] transition-colors">
                    {item.value}
                  </p>
                </div>
              </a>
            ))}
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">
                Commander par WhatsApp
              </h3>
              <p className="text-gray-400 mb-6">
                Le moyen le plus rapide de passer commande. Réponse sous 15 minutes en journée.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Bonjour%2C%20je%20souhaite%20commander%20sur%20TechUp%20Antilles`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-semibold hover:bg-[#20b859] transition-colors"
              >
                <MessageCircle size={20} />
                Ouvrir WhatsApp
              </a>
            </div>

            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">
                Suivez-nous sur Instagram
              </h3>
              <p className="text-gray-400 mb-6">
                Nouveautés, promos exclusives et actus tech en avant-première.
              </p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <Instagram size={20} />
                @techupantilles
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <WhatsAppButton />
    </div>
  );
};

export default Contact;