import { motion } from 'framer-motion';
import { logoItems } from '../../data/homeContent';

export const Logos: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center text-sm font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-10"
        >
          Ils nous font confiance
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 items-center">
          {logoItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex items-center justify-center"
            >
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/5 to-[var(--primary)]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative px-6 py-4">
                  <span className="text-lg font-bold text-[var(--muted)] group-hover:text-[var(--text)] transition-colors duration-300">
                    {item.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Separator */}
        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>
    </section>
  );
};

export default Logos;