import { motion } from 'framer-motion';
import { MapPin, Zap, Shield, Heart, Sparkles, Users } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const teamMembers = [
  {
    name: 'Maxime Delacroix',
    role: 'Fondateur & CEO',
    bio: 'Passionné de tech depuis toujours, Maxime a fondé Tech Up Antilles pour apporter le meilleur du mobile aux Antilles.',
    initials: 'MD',
  },
  {
    name: 'Sophia Leblanc',
    role: 'Directrice Marketing',
    bio: 'Experte en street-tech et branding, Sophia donne à la marque son identité visuelle unique et percutante.',
    initials: 'SL',
  },
  {
    name: 'Kévin Martin',
    role: 'Responsable Achats',
    bio: 'Il sélectionne les accessoires les plus innovants et les plus fiables pour garantir une qualité irréprochable.',
    initials: 'KM',
  },
  {
    name: 'Camille Fontaine',
    role: 'Community Manager',
    bio: 'Elle anime notre communauté sur Instagram et organise les événements en boutique à Fort-de-France.',
    initials: 'CF',
  },
];

const values = [
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Nous sélectionnons les accessoires les plus récents et performants du marché.',
  },
  {
    icon: Shield,
    title: 'Qualité premium',
    description: 'Chaque produit est testé pour garantir une durabilité et une compatibilité optimales.',
  },
  {
    icon: Heart,
    title: 'Service client',
    description: 'Notre équipe est à votre écoute, en ligne et en boutique, pour vous conseiller.',
  },
  {
    icon: Sparkles,
    title: 'Style unique',
    description: 'Un design néon et urbain qui reflète l’énergie de Fort-de-France.',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans">
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Hero */}
        <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Notre histoire
              </div>
              <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-none text-white">
                Tech Up <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Antilles</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                La boutique d’accessoires mobiles premium qui électrise Fort-de-France. 
                Née d’une passion pour la technologie et le style urbain.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="py-24 lg:py-32 px-4"
        >
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white">
                Équipe ton smartphone avec <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">style</span>.
              </h2>
              <p className="mt-6 text-lg text-white/70 leading-relaxed">
                Chez Tech Up Antilles, nous croyons que chaque accessoire est une extension de ta personnalité. 
                Notre mission : te proposer les meilleurs coques, chargeurs, écouteurs et protections d’écran, 
                en plein cœur de Fort-de-France. Rapidité, qualité et un service client qui déchire.
              </p>
              <div className="mt-8 flex items-center gap-4 text-white/50 text-sm">
                <MapPin className="w-5 h-5 text-violet-400" />
                <span>45 Rue de la République, Fort-de-France 97200</span>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-20">📍</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                <p className="text-sm text-white/80">Notre boutique – Fort-de-France</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Équipe */}
        <section className="py-24 lg:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                L'équipe
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Ceux qui font la différence
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg font-bold mb-4">
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-violet-400 mt-1">{member.role}</p>
                  <p className="mt-3 text-white/60 text-sm leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="py-24 lg:py-32 px-4 bg-black/20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Nos valeurs
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Ce qui nous anime
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                  <p className="mt-2 text-white/60 text-sm leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Prêt à passer au niveau supérieur ?
              </h2>
              <p className="mt-4 text-lg text-white/60">
                Découvre nos accessoires et rejoins la communauté Tech Up Antilles.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-violet-500/25"
                >
                  Voir la boutique
                  <Sparkles className="w-5 h-5" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/10 transition-all duration-200"
                >
                  Nous contacter
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;