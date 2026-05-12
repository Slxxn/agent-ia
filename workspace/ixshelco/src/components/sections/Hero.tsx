import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Clock, Award, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { heroContent } from '../../data/homeContent';

const LOGO_URL = 'https://firebasestorage.googleapis.com/v0/b/agent-ia-2d81a.firebasestorage.app/o/logos%2FChatGPT%20Image%202%20mai%202026%2C%2014_38_24.png?alt=media&token=7426abf5-097b-4e2b-a403-605e95a0c511';

const stats = [
  { icon: Star, value: '4.9', label: 'Avis clients' },
  { icon: Shield, value: '100%', label: 'Satisfaction' },
  { icon: Clock, value: '5+', label: 'Années d\'expertise' },
  { icon: Award, value: '500+', label: 'Clientes fidèles' },
];

export const Hero: React.FC = () => {
  const { title, subtitle, primaryCta, secondaryCta } = heroContent;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/5 to-transparent rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-left"
          >
            {/* Badge with logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <Badge variant="accent" size="sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Studio de Nail Art à domicile
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] mb-6"
            >
              <span className="text-[var(--text)]">{title.split(' ')[0]} </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]">
                {title.split(' ').slice(1).join(' ')}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-xl lg:text-2xl font-medium text-[var(--muted)] mb-4"
            >
              {subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button variant="primary" size="lg" className="group">
                {primaryCta}
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                {secondaryCta}
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-wrap gap-8 lg:gap-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <span className="text-lg font-bold text-[var(--text)]">{stat.value}</span>
                    <span className="text-sm text-[var(--muted)] ml-1">{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-3xl blur-3xl" />
              <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6">
                <img src={LOGO_URL} alt="IXSHEL&CO" className="h-40 w-auto object-contain" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  {[
                    { label: 'Clientes', value: '150+' },
                    { label: 'Note', value: '4.9' },
                    { label: 'Designs', value: '50+' },
                    { label: 'Taux satisf.', value: '99%' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)] text-center">
                      <p className="text-2xl font-bold text-[var(--primary)]">{item.value}</p>
                      <p className="text-sm text-[var(--muted)]">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
