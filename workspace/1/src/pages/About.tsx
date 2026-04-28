import { motion } from 'framer-motion';
import { Facebook, Instagram, MessageCircle, Truck, Shield, Zap, Headphones, Package } from 'lucide-react';
import WhatsAppButton from '../components/WhatsAppButton';
import { cn } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const stats = [
  { icon: Package, value: '200+', label: 'Commandes livrées' },
  { icon: Headphones, value: '< 1h', label: 'Temps réponse moyen' },
  { icon: Truck, value: '24h', label: 'Livraison express' },
  { icon: Shield, value: '100%', label: 'Satisfaction client' },
];

const values = [
  {
    icon: Zap,
    title: 'Produits premium',
    description: 'Nous sélectionnons chaque produit pour sa qualité, sa fiabilité et son rapport qualité-prix.',
  },
  {
    icon: Truck,
    title: 'Livraison locale rapide',
    description: 'Livraison en 24h en Guadeloupe et Martinique. Plus besoin d’attendre des semaines.',
  },
  {
    icon: Shield,
    title: 'Garantie et confiance',
    description: 'Tous nos produits sont garantis. Service après-vente réactif via WhatsApp.',
  },
  {
    icon: MessageCircle,
    title: 'Support humain',
    description: 'Un vrai chatbot ? Non, une vraie personne. Contactez-nous par WhatsApp, on répond en moins d’une heure.',
  },
];

const team = [
  { name: 'Lucas', role: 'Fondateur & Tech lover', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { name: 'Mélissa', role: 'Service client & Logistique', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
  { name: 'Kévin', role: 'Marketing & Réseaux', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
];

export const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleWhatsApp = () => {
    const txt = encodeURIComponent('Bonjour TechUp Antilles ! Je souhaite en savoir plus sur votre boutique.');
    window.open(`https://wa.me/590690000000?text=${txt}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <motion.span
              className="mb-4 inline-block rounded-full bg-violet-500/10 px-4 py-1 text-sm font-medium text-violet-400 backdrop-blur-sm"
              variants={fadeInUp}
              custom={0}
            >
              Qui sommes-nous ?
            </motion.span>
            <motion.h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              variants={fadeInUp}
              custom={1}
            >
              TechUp <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Antilles</span>
            </motion.h1>
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 sm:text-xl"
              variants={fadeInUp}
              custom={2}
            >
              La boutique tech premium qui livre vos gadgets préférés en Guadeloupe et Martinique, 
              avec un service client réactif et une passion pour l'innovation.
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-4" variants={fadeInUp} custom={3}>
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:bg-violet-500 hover:shadow-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <MessageCircle className="h-5 w-5" />
                Contactez-nous
              </button>
              <a
                href="https://instagram.com/techupantilles"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-6 py-3 text-sm font-semibold text-gray-200 backdrop-blur-sm transition-all hover:border-gray-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <Instagram className="h-5 w-5" />
                Notre Instagram
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative border-y border-gray-800/50 bg-gray-900/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-3 rounded-full bg-violet-500/10 p-3">
                  <stat.icon className="h-6 w-6 text-violet-400" />
                </div>
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <span className="mt-1 text-sm text-gray-400">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="grid items-center gap-12 lg:grid-cols-2"
          >
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">histoire</span>
              </h2>
              <p className="mt-6 text-gray-400 leading-relaxed">
                TechUp Antilles est née d’un constat simple : en Guadeloupe et Martinique, 
                trouver du matériel tech premium, livré rapidement et avec un vrai service client, 
                c’était presque mission impossible.
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Nous avons décidé de changer ça. En 2023, nous avons lancé notre boutique en ligne 
                avec une promesse forte : les meilleurs smartphones, accessoires et gadgets, 
                livrés en 24 heures, avec un support humain disponible sur WhatsApp.
              </p>
              <p className="mt-4 text-gray-400 leading-relaxed">
                Aujourd’hui, plus de 200 commandes plus tard, nous continuons à innover 
                pour vous offrir le meilleur de la tech, sans attendre des semaines.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 p-1">
                <div className="h-full w-full rounded-2xl bg-gray-900" />
              </div>
              <img
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=800&fit=crop"
                alt="TechUp Antilles"
                className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] rounded-2xl object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section ref={sectionRef} className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">valeurs</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Ce qui nous anime chaque jour pour vous offrir la meilleure expérience tech.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={index}
                className="group rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-violet-500/10 p-3 group-hover:bg-violet-500/20 transition-colors">
                  <value.icon className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              L'équipe <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">TechUp</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Des passionnés de tech au service des Antilles.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group text-center"
              >
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-violet-500/20 transition-all group-hover:border-violet-400/50">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gray-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/10 to-cyan-900/10 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Prêt à découvrir la tech autrement ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Rejoignez la communauté TechUp Antilles et recevez vos produits en 24h.
            </p>
            <button
              onClick={handleWhatsApp}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <MessageCircle className="h-5 w-5" />
              Commencer maintenant
            </button>
          </motion.div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
};

export default About;