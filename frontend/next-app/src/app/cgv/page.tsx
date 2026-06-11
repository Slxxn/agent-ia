import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente — builderz",
  description: "CGV builderz.shop — prestation de création de sites web.",
};

export default function CGV() {
  return (
    <div style={{ minHeight: "100dvh", background: "#060608", color: "#E2E2EA", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 80px" }}>

        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(226,226,234,0.4)", textDecoration: "none", marginBottom: 48 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6.5 3.5L3 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour à l&apos;accueil
        </a>

        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Conditions générales de vente
        </h1>
        <p style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", marginBottom: 56 }}>
          En vigueur à compter du {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>1. Objet</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Les présentes conditions générales régissent la prestation de création de sites web proposée par builderz (ci-après &laquo; le Prestataire &raquo;) via le site builderz.shop.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>2. Description du service</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Le Prestataire réalise des sites web vitrine une page, sur mesure, à partir du brief fourni par le client via le formulaire en ligne. Le site est conçu avec l&apos;aide d&apos;outils d&apos;intelligence artificielle, supervisé par un expert humain, et livré hébergé sur Google Firebase Hosting avec SSL inclus.
            </p>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9, marginTop: 12 }}>
              Des options supplémentaires (pages additionnelles, prise de rendez-vous, domaine personnalisé, etc.) peuvent être proposées sur devis séparé.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>3. Tarification</h2>
            <div style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              <p>Le tarif de base pour un site vitrine one-page est de <strong style={{ color: "rgba(226,226,234,0.8)" }}>290 € TTC</strong>.</p>
              <p style={{ marginTop: 10 }}>Les options sont sur devis. La plupart des projets avec options se situent entre 290€ et 600€. Un devis précis est transmis sous 48h après réception de la demande.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>4. Modalités de paiement</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Le paiement s&apos;effectue en intégralité à la commande, par virement bancaire. Le site est mis en ligne après réception et confirmation du paiement.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>5. Délai de livraison</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              La mise en ligne est garantie <strong style={{ color: "rgba(226,226,234,0.8)" }}>sous 5 jours ouvrés</strong> à compter de la validation du brief par le Prestataire et du paiement intégral. La validation du brief peut nécessiter des échanges avec le client pour affiner les informations fournies.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>6. Propriété et livraison du code source</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              À la livraison et après règlement complet, le client devient propriétaire du code source de son site. Le Prestataire reste libre de mentionner la réalisation dans son portfolio, sauf demande expresse contraire.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>7. Garantie et retouches incluses</h2>
            <div style={{ padding: "20px 24px", borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: "rgba(226,226,234,0.7)", lineHeight: 1.9, fontWeight: 600 }}>
                Aucun remboursement n&apos;est accordé après livraison du site. En contrepartie, 30 jours de modifications sont inclus selon les conditions ci-dessous.
              </p>
            </div>
            <div style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Durée :</strong> 30 jours calendaires à compter de la date de mise en ligne.</p>
              <p style={{ marginTop: 8 }}><strong style={{ color: "rgba(226,226,234,0.8)" }}>Volume :</strong> jusqu&apos;à 3 demandes de modifications groupées.</p>
              <p style={{ marginTop: 8 }}><strong style={{ color: "rgba(226,226,234,0.8)" }}>Portée — ce qui est inclus :</strong></p>
              <ul style={{ margin: "8px 0 0 20px", display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  "Modification de textes existants",
                  "Remplacement d'images",
                  "Ajustements de couleurs ou de polices",
                  "Mise à jour des coordonnées, horaires, tarifs",
                  "Petits ajustements de mise en page sur le contenu existant",
                ].map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p style={{ marginTop: 12 }}><strong style={{ color: "rgba(226,226,234,0.8)" }}>Exclusions — hors garantie, sur devis :</strong></p>
              <ul style={{ margin: "8px 0 0 20px", display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  "Ajout de nouvelles pages",
                  "Ajout de nouvelles fonctionnalités",
                  "Refonte du design ou de la structure",
                  "Changement d'orientation ou de secteur d'activité",
                ].map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p style={{ marginTop: 12 }}><strong style={{ color: "rgba(226,226,234,0.8)" }}>Délai d&apos;application :</strong> les modifications demandées sont appliquées sous 5 jours ouvrés.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>8. Obligations du client</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Le client s&apos;engage à fournir des informations exactes et complètes dans le formulaire, et à répondre dans des délais raisonnables aux demandes de clarification. Le client garantit disposer des droits sur les éléments fournis (textes, images, logo).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>9. Droit applicable</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant tout recours judiciaire.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>10. Contact</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Pour toute question relative aux présentes CGV :{" "}
              <a href="mailto:contact@builderz.shop" style={{ color: "#6366f1", textDecoration: "none" }}>contact@builderz.shop</a>
            </p>
          </section>

        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20 }}>
          <a href="/" style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}>Accueil</a>
          <a href="/mentions-legales" style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}>Mentions légales</a>
        </div>
      </div>
    </div>
  );
}
