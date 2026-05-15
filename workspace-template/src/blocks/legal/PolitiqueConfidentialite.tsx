import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

export interface PolitiqueConfidentialiteProps {
  companyName: string;
  email: string;
  lastUpdated?: string;
}

export default function PolitiqueConfidentialite({ companyName, email, lastUpdated }: PolitiqueConfidentialiteProps) {
  const sections = [
    {
      title: '1. Responsable du traitement',
      text: `${companyName} est responsable du traitement de vos données personnelles collectées via ce site. Contact : ${email}`,
    },
    {
      title: '2. Données collectées',
      text: 'Nous collectons uniquement les données que vous nous fournissez volontairement (formulaires de contact, de devis ou d'inscription) : nom, prénom, adresse email, numéro de téléphone, et le contenu de votre message.',
    },
    {
      title: '3. Finalité du traitement',
      text: 'Vos données sont utilisées pour : répondre à vos demandes de contact ou de devis, vous informer de nos actualités si vous y avez consenti, améliorer notre service.',
    },
    {
      title: '4. Durée de conservation',
      text: 'Vos données sont conservées pendant 3 ans à compter de votre dernier contact, ou jusqu'à votre demande de suppression.',
    },
    {
      title: '5. Partage des données',
      text: 'Vos données ne sont jamais vendues. Elles peuvent être transmises à des sous-traitants techniques (hébergeur, outil d'emailing) dans le cadre strict de l'exécution de nos services.',
    },
    {
      title: '6. Vos droits (RGPD)',
      text: `Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité, et d'opposition. Pour les exercer : ${email}. Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).`,
    },
    {
      title: '7. Sécurité',
      text: 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction.',
    },
  ];

  return (
    <section style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 100, paddingBottom: 80 }}>
      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}
      >
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--text)' }}>
            Politique de confidentialité
          </h1>
        </motion.div>

        {lastUpdated && (
          <motion.p variants={fadeUp} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 48 }}>
            Dernière mise à jour : {lastUpdated}
          </motion.p>
        )}

        {sections.map((s, i) => (
          <motion.div key={i} variants={fadeUp} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--bd)' }}>
              {s.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>{s.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
