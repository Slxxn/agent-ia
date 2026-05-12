import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Zap, Heart } from 'lucide-react';

const solutions = [
  {
    icon: CheckCircle,
    title: 'Produits Authentiques Garantis',
    description: 'Nous travaillons directement avec les fabricants et distributeurs officiels. Chaque produit est certifié et garanti.'
  },
  {
    icon: Sparkles,
    title: 'Qualité Premium Sélectionnée',
    description: 'Nous testons chaque référence avant de la proposer. Seuls les meilleurs produits, au meilleur rapport qualité-prix.'
  },
  {
    icon: Zap,
    title: 'Livraison Ultra-Rapide',
    description: 'Commandez avant 14h, recevez le lendemain en Martinique. Retrait gratuit en magasin à Fort-de-France.'
  },
  {
    icon: Heart,
    title: 'Service Client Exceptionnel',
    description: 'Conseils personnalisés, échanges faciles, satisfaction garantie. Une équipe passionnée à votre écoute.'
  }
];

const SolutionSection = () => {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-violet-100">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-green-400 bg-green-500/8 border border-green-500/20 rounded-full px-3 py-1.5 mb-4">
            Notre solution
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text)]">
            TECH-UP Antilles : la solution locale pour vos accessoires mobiles
          </h2>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Nous avons créé la boutique que nous aurions aimé trouver. Simple, fiable, et proche de vous.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 mb-4">
                <solution.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-3">
                {solution.title}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed">
                {solution.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;