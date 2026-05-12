import { motion } from 'framer-motion';
import { Truck, Shield, Star, ArrowRight, MessageCircle } from 'lucide-react';
import { whatsappLink } from '../../lib/utils';

const Hero = () => {
  const phone = '+596696053363';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-300 bg-violet-900/50 border border-violet-700/50 rounded-full px-3 py-1.5 mb-6">
                <Star className="w-3 h-3 fill-violet-300" />
                N°1 en Martinique & Guadeloupe
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6"
            >
              Accessoires
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">
                mobiles premium
              </span>
              aux Antilles
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-300 mb-10 max-w-lg leading-relaxed"
            >
              Coques, chargeurs, écouteurs et plus — des accessoires de qualité livrés rapidement en Martinique et Guadeloupe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-violet-600/25"
              >
                Voir le catalogue
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={whatsappLink(phone, 'Bonjour TECH-UP Antilles, j\'ai une question.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5 text-green-400" />
                WhatsApp
              </a>
            </motion.div>
          </div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl ring-1 ring-white/10">
              <img
                src="https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80"
                alt="Accessoires mobiles premium"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute bottom-6 left-6 right-6 flex gap-3"
              >
                <div className="flex-1 p-3 rounded-xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold text-slate-800">Livraison 24-48h</span>
                  </div>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold text-slate-800">Garantie qualité</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
