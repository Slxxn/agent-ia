import { motion } from 'framer-motion';
import { Lightbulb, Target, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { problemSolution } from '../../data/homeContent';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export const ProblemSolution: React.FC = () => {
  const { problem, solution } = problemSolution;

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[var(--surface)]">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[var(--primary)]/5 via-[var(--accent)]/3 to-transparent rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
        >
          {/* Problem Side */}
          <motion.div variants={item} className="space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-red-400 bg-red-400/8 border border-red-400/20 rounded-full px-3 py-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Le constat
            </div>
            
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight text-[var(--text)]">
              {problem.title}
            </h2>
            
            <p className="text-base lg:text-lg leading-relaxed text-[var(--muted)]">
              {problem.description}
            </p>

            <ul className="space-y-4">
              {problem.painPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <XCircle className="w-5 h-5 text-red-400/60 mt-0.5 shrink-0" />
                  <span className="text-[var(--muted)]">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Solution Side */}
          <motion.div variants={item} className="space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[var(--success)] bg-[var(--success)]/8 border border-[var(--success)]/20 rounded-full px-3 py-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Notre solution
            </div>
            
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">
                {solution.title}
              </span>
            </h2>
            
            <p className="text-base lg:text-lg leading-relaxed text-[var(--muted)]">
              {solution.description}
            </p>

            <ul className="space-y-4">
              {solution.benefits.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[var(--success)] mt-0.5 shrink-0" />
                  <span className="text-[var(--text)]">{point}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Button variant="primary" size="lg" className="group">
                Découvrir notre approche
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;