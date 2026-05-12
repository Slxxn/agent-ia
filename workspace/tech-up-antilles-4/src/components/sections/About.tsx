import { motion } from 'framer-motion';
import { Award, Users, Package, MapPin } from 'lucide-react';
import Button from '../ui/Button';

const stats = [
  { icon: Users, value: '500+', label: 'Clients satisfaits' },
  { icon: Package, value: '1000+', label: 'Produits vendus' },
  { icon: Award, value: '4.8', label: 'Note moyenne' },
  { icon: MapPin, value: '1', label: 'Boutique à Fort-de-France' }
];

const About = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-sky-100/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80"
                alt="TECH-UP Antilles - Boutique d'accessoires mobiles"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-lg border border-slate-200 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Qualité garantie</p>
                  <p className="text-xs text-slate-500">Produits testés</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5 mb-4">
              À propos
            </span>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Votre expert en accessoires mobiles en Martinique
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed mb-8">
              <p>
                TECH-UP Antilles est née d'une passion pour la technologie et d'un constat simple : 
                les Martiniquais méritent d'avoir accès aux meilleurs accessoires mobiles, sans avoir 
                à attendre des semaines de livraison.
              </p>
              <p>
                Située au cœur de Fort-de-France, notre boutique vous propose une sélection rigoureuse 
                de produits : coques, chargeurs, écouteurs, protections écran et bien plus encore. 
                Chaque article est choisi pour sa qualité et sa durabilité.
              </p>
              <p>
                Notre engagement : vous offrir des produits fiables, un conseil personnalisé et un 
                service après-vente irréprochable. Parce que votre satisfaction est notre priorité.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3">
                  <stat.icon className="w-5 h-5 text-violet-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <Button variant="filled" size="lg">
              En savoir plus
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;