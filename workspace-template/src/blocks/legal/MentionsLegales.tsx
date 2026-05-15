import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';

export interface MentionsLegalesProps {
  companyName: string;
  legalForm?: string;
  capital?: string;
  siret?: string;
  address: string;
  directorName: string;
  email: string;
  phone?: string;
  hostName?: string;
  hostAddress?: string;
}

export default function MentionsLegales({ companyName, legalForm, capital, siret, address, directorName, email, phone, hostName, hostAddress }: MentionsLegalesProps) {
  return (
    <section style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 100, paddingBottom: 80 }}>
      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}
      >
        <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Mentions légales
        </motion.h1>
        <motion.p variants={fadeUp} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 48 }}>
          Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.
        </motion.p>

        {[
          {
            title: '1. Éditeur du site',
            items: [
              ['Raison sociale', companyName],
              legalForm && ['Forme juridique', legalForm],
              capital && ['Capital social', capital],
              siret && ['SIRET', siret],
              ['Adresse', address],
              ['Directeur de publication', directorName],
              ['Email', email],
              phone && ['Téléphone', phone],
            ].filter(Boolean) as string[][],
          },
          {
            title: '2. Hébergement',
            items: [
              ['Hébergeur', hostName || 'Firebase Hosting / Google LLC'],
              ['Adresse', hostAddress || '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA'],
            ],
          },
          {
            title: '3. Propriété intellectuelle',
            text: `L'ensemble des contenus présents sur ce site (textes, images, graphismes, logo, icônes) sont la propriété exclusive de ${companyName}, sauf mention contraire. Toute reproduction, distribution ou modification, même partielle, est strictement interdite sans autorisation préalable.`,
          },
          {
            title: '4. Données personnelles',
            text: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à : ${email}`,
          },
          {
            title: '5. Cookies',
            text: 'Ce site peut utiliser des cookies à des fins de mesure d'audience et d'amélioration de l'expérience utilisateur. Vous pouvez gérer vos préférences via les paramètres de votre navigateur.',
          },
        ].map((section, i) => (
          <motion.div key={i} variants={fadeUp} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--bd)' }}>
              {section.title}
            </h2>
            {section.items ? (
              <dl style={{ display: 'grid', gap: 8 }}>
                {section.items.map(([key, val], j) => (
                  <div key={j} style={{ display: 'flex', gap: 16 }}>
                    <dt style={{ minWidth: 180, fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{key}</dt>
                    <dd style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>{val}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>{section.text}</p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
