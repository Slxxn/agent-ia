import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, MessageCircle, Instagram } from 'lucide-react';
import { cn } from '../../lib/utils';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Adresse',
    value: '93 Rue Victor Hugo, 97200 Fort-de-France',
    href: 'https://maps.google.com/?q=93+Rue+Victor+Hugo+Fort-de-France+97200'
  },
  {
    icon: Clock,
    label: 'Horaires',
    value: 'Lun–Ven 9h–18h · Sam 9h–14h · Dim fermé'
  },
  {
    icon: Phone,
    label: 'Téléphone',
    value: '+596 696 05 33 63',
    href: 'tel:+596696053363'
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Écrivez-nous sur WhatsApp',
    href: 'https://wa.me/596696053363'
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@techup_antilles',
    href: 'https://instagram.com/techup_antilles'
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@techup-antilles.com',
    href: 'mailto:contact@techup-antilles.com'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const InfosSection = () => {
  return (
    <section id="contact" className="relative py-16 lg:py-24 bg-violet-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-50/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-3 py-1.5 mb-4">
            Infos pratiques
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Retrouvez-nous
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Venez nous rencontrer en boutique ou contactez-nous en ligne
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Carte */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3879.4!2d-61.074!3d14.605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDM2JzE4LjAiTiA2McKwMDQnMjYuNCJX!5e0!3m2!1sfr!2sfr!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TECH-UP Antilles - Fort-de-France"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Contact info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="flex flex-col justify-center"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  className="group"
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                        <item.icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium text-slate-900 group-hover:text-violet-700 transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InfosSection;