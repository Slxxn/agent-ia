import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { theme } from '../lib/theme';

export const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Adresse',
      value: theme.contact.address,
      href: `https://maps.google.com/?q=${encodeURIComponent(theme.contact.address)}`,
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: theme.contact.phone,
      href: `tel:${theme.contact.phone}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: theme.contact.email,
      href: `mailto:${theme.contact.email}`,
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun-Ven: 9h-19h | Sam: 10h-17h',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[#550b14]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#7e6961]/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase text-[#550b14] bg-[#550b14]/8 border border-[#550b14]/20 rounded-full px-3 py-1.5 mb-4">
            Contact
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-[#1a1a1a] mb-4">
            Prenons rendez-vous
          </h1>
          <p className="text-lg text-[#7e6961] max-w-2xl mx-auto">
            Que ce soit pour une question, une réservation ou simplement pour en savoir plus sur nos services, nous sommes là pour vous.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#e2e8f0] rounded-2xl p-8 lg:p-10 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#550b14]/10 mb-6">
                  <CheckCircle className="w-8 h-8 text-[#550b14]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">Message envoyé !</h3>
                <p className="text-[#7e6961] mb-6">
                  Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Envoyer un autre message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-2xl p-8 lg:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nom complet"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <Input
                  label="Téléphone"
                  type="tel"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                />
                <Textarea
                  label="Message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="Décrivez votre demande..."
                  rows={5}
                  required
                />
                <Button type="submit" variant="filled" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </span>
                  )}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white border border-[#e2e8f0] rounded-xl p-6 hover:border-[#550b14]/20 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#550b14]/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#550b14]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] mb-1">{item.label}</h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-[#7e6961] hover:text-[#550b14] transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[#7e6961]">{item.value}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden h-64"
            >
              <div className="w-full h-full bg-gradient-to-br from-[#550b14]/5 to-[#7e6961]/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#550b14] mx-auto mb-2" />
                  <p className="text-sm text-[#7e6961]">Carte interactive</p>
                  <p className="text-xs text-[#7e6961]/70">{theme.contact.address}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
