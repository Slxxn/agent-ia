import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail, MapPin, Clock, Instagram } from 'lucide-react';
import Button from '../ui/Button';

const contactMethods = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+596 696 05 33 63',
    href: 'https://wa.me/596696053363',
    description: 'Temps de réponse moyen : 15 min',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    hoverColor: 'hover:bg-emerald-100'
  },
  {
    icon: Phone,
    label: 'Téléphone',
    value: '+596 696 05 33 63',
    href: 'tel:+596696053363',
    description: 'Lun–Ven 9h–18h · Sam 9h–14h',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    hoverColor: 'hover:bg-sky-100'
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@techup-antilles.com',
    href: 'mailto:contact@techup-antilles.com',
    description: 'Réponse sous 24h',
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    hoverColor: 'hover:bg-violet-100'
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@techup_antilles',
    href: 'https://instagram.com/techup_antilles',
    description: 'Suivez nos actualités',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    hoverColor: 'hover:bg-pink-100'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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

const Contact = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-50/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-50/30 rounded-full blur-[80px]" />
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
            Contact
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900 mb-4">
            Restons en contact
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Une question ? Un conseil ? Notre équipe est là pour vous aider
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact methods */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-4"
          >
            {contactMethods.map((method) => (
              <motion.a
                key={method.label}
                variants={itemVariants}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-4 p-4 rounded-xl border ${method.color} ${method.hoverColor} transition-all duration-200 group`}
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <method.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{method.label}</p>
                  <p className="text-sm text-slate-600 truncate">{method.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{method.description}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Map / Store info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm mb-6">
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

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">TECH-UP Antilles</p>
                  <p className="text-sm text-slate-600">93 Rue Victor Hugo</p>
                  <p className="text-sm text-slate-600">97200 Fort-de-France</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Horaires d'ouverture</p>
                  <p className="text-sm text-slate-600">Lun–Ven : 9h–18h</p>
                  <p className="text-sm text-slate-600">Sam : 9h–14h</p>
                  <p className="text-sm text-slate-400">Dim : Fermé</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;