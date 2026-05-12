import { motion } from 'framer-motion';
import { Search, XCircle, AlertTriangle, Smartphone } from 'lucide-react';

const problems = [
  {
    icon: Search,
    title: 'Difficile à trouver',
    description: 'Les accessoires mobiles de qualité sont rares en Martinique. Entre les contrefaçons et les prix excessifs, difficile de s\'y retrouver.'
  },
  {
    icon: XCircle,
    title: 'Qualité douteuse',
    description: 'Combien de coques jaunies, de câbles qui lâchent après un mois, de chargeurs qui surchauffent ? La qualité est un luxe.'
  },
  {
    icon: AlertTriangle,
    title: 'Livraison longue',
    description: 'Commandez sur internet et attendez 2 à 3 semaines. Sans parler des frais de douane et des retours compliqués.'
  },
  {
    icon: Smartphone,
    title: 'Manque de choix',
    description: 'Les grandes surfaces proposent un choix limité. Pas de produits récents, pas de marques premium, pas de conseils personnalisés.'
  }
];

const ProblemSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-violet-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-red-400 bg-red-500/8 border border-red-500/20 rounded-full px-3 py-1.5 mb-4">
            Le constat
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text)]">
            Trouver des accessoires de qualité en Martinique, un vrai parcours du combattant
          </h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Vous connaissez le problème. Nous l'avons vécu aussi. C'est pour ça que TECH-UP Antilles existe.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex gap-4 p-6 rounded-2xl bg-[var(--bg)] border border-[var(--border)]"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <problem.icon className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {problem.title}
                </h3>
                <p className="text-[var(--muted)] leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;