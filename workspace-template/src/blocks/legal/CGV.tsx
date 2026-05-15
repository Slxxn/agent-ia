import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';

export interface CGVProps {
  companyName: string;
  address: string;
  email: string;
  siret?: string;
  currency?: string;
  lastUpdated?: string;
}

export default function CGV({ companyName, address, email, siret, currency = 'EUR', lastUpdated }: CGVProps) {
  const sections = [
    {
      title: 'Article 1 — Objet',
      text: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre ${companyName} et ses clients. Toute commande implique l'acceptation sans réserve des présentes CGV.`,
    },
    {
      title: 'Article 2 — Prix',
      text: `Les prix sont indiqués en ${currency === 'EUR' ? 'euros (€)' : currency}, toutes taxes comprises (TTC). ${companyName} se réserve le droit de modifier ses prix à tout moment, les services étant facturés sur la base du tarif en vigueur au moment de la commande.`,
    },
    {
      title: 'Article 3 — Commande',
      text: 'Toute commande est ferme et définitive après confirmation écrite de notre part. Un acompte peut être demandé avant le début de la prestation.',
    },
    {
      title: 'Article 4 — Paiement',
      text: `Le paiement est exigible à réception de la facture. En cas de retard, des pénalités de retard au taux légal en vigueur seront appliquées, ainsi qu'une indemnité forfaitaire pour frais de recouvrement de 40€.`,
    },
    {
      title: 'Article 5 — Livraison et délais',
      text: 'Les délais communiqués sont indicatifs. ${companyName} s\'engage à informer le client en cas de retard significatif. Aucune pénalité ne pourra être appliquée pour des retards dus à des causes extérieures à notre contrôle.',
    },
    {
      title: 'Article 6 — Droit de rétractation',
      text: 'Conformément à l'article L221-18 du Code de la Consommation, vous disposez d'un droit de rétractation de 14 jours à compter de la conclusion du contrat pour les prestations de services.',
    },
    {
      title: 'Article 7 — Responsabilité',
      text: `${companyName} ne saurait être tenue responsable des dommages indirects résultant de l'utilisation de ses services. Notre responsabilité est limitée au montant de la commande concernée.`,
    },
    {
      title: 'Article 8 — Propriété intellectuelle',
      text: `Tous les contenus créés par ${companyName} restent sa propriété jusqu'au paiement intégral. Après paiement complet, les droits d'utilisation sont transférés au client selon les modalités définies au contrat.`,
    },
    {
      title: 'Article 9 — Données personnelles',
      text: `Les données collectées dans le cadre de la relation commerciale sont traitées conformément à notre Politique de Confidentialité. Contact DPO : ${email}`,
    },
    {
      title: 'Article 10 — Litiges',
      text: 'En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de notre siège social seront seuls compétents.',
    },
  ];

  return (
    <section style={{ minHeight: '100dvh', background: 'var(--bg)', paddingTop: 100, paddingBottom: 80 }}>
      <motion.div
        variants={stagger(0.05)}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(1.5rem,5vw,3rem)' }}
      >
        <motion.h1 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
          Conditions Générales de Vente
        </motion.h1>

        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{companyName}</span>
          {siret && <span style={{ fontSize: 12, color: 'var(--muted)' }}>SIRET : {siret}</span>}
          {lastUpdated && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Mise à jour : {lastUpdated}</span>}
        </motion.div>

        {sections.map((s, i) => (
          <motion.div key={i} variants={fadeUp} style={{ marginBottom: 32 }}>
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
