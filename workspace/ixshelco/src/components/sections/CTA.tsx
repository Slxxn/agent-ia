import { motion } from 'framer-motion';

import { ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export const CTA: React.FC = () => {
  return (
    <section className="relative py-12 lg:py-16 overflow-hidden bg-[#f8f8f7]">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#550b14]/8 rounded-full blur-[160px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#550b14]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#550b14]/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="relative max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[#550b14] bg-[#550b14]/8 border border-[#550b14]/20 rounded-full px-3 py-1.5 mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Prête à sublimer vos ongles ?
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-[#1a1a1a]"
          >
            Offrez-vous des ongles{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550b14] to-[#7e6961]">
              dignes d'un salon
            </span>{' '}
            sans quitter votre cocon
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-6 text-base lg:text-lg leading-relaxed text-[#7e6961] max-w-2xl mx-auto"
          >
            Réservez votre séance de manucure ou nail art en quelques clics. 
            Dans mon studio à domicile, chaque détail compte pour vous offrir une expérience unique.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/contact">
              <Button
                variant="primary"
                size="lg"
                className="group bg-[#550b14] hover:bg-[#550b14]/90 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-[#550b14]/20 hover:shadow-[#550b14]/30 transition-all duration-200 hover:scale-[1.02]"
              >
                Réserver maintenant
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
            <a
              href="https://wa.me/33600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-[#7e6961] border border-[#7e6961]/20 hover:border-[#550b14]/30 hover:text-[#550b14] bg-white transition-all duration-200 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contacter via WhatsApp
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-[#7e6961]/10"
          >
            <p className="text-xs text-[#7e6961] mb-6">Aucune carte bancaire requise</p>
            <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
              <div className="flex items-center gap-2 text-sm text-[#7e6961]">
                <Shield className="w-4 h-4 text-[#550b14]" />
                Paiement sécurisé
              </div>
              <div className="flex items-center gap-2 text-sm text-[#7e6961]">
                <Clock className="w-4 h-4 text-[#550b14]" />
                Réservation flexible
              </div>
              <div className="flex items-center gap-2 text-sm text-[#7e6961]">
                <Sparkles className="w-4 h-4 text-[#550b14]" />
                Produits professionnels
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;