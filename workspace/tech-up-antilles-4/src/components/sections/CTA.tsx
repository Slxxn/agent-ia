import { motion } from 'framer-motion';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800" />
      
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-400/20 rounded-full blur-[160px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-200 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-6">
            Prêt à commander ?
          </span>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6">
            Vos accessoires vous{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-sky-200">
              attendent
            </span>
          </h2>
          
          <p className="text-lg lg:text-xl text-violet-100/80 max-w-2xl mx-auto mb-10">
            Commandez dès maintenant sur WhatsApp ou passez nous voir en boutique. 
            Nos experts sont là pour vous conseiller.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/596696053363"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="whatsapp"
                size="lg"
                className="text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Commander sur WhatsApp
              </Button>
            </a>
            <a href="tel:+596696053363">
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white/20 hover:bg-white/10 text-base"
              >
                <Phone className="w-5 h-5" />
                +596 696 05 33 63
              </Button>
            </a>
          </div>

          <p className="mt-6 text-sm text-violet-200/60">
            Réponse sous 24h · Paiement sécurisé · Livraison en Martinique
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;