import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — builderz",
  description: "Mentions légales du site builderz.shop",
};

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: "100dvh", background: "#060608", color: "#E2E2EA", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 80px" }}>

        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(226,226,234,0.4)", textDecoration: "none", marginBottom: 48 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 7H3M6.5 3.5L3 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour à l&apos;accueil
        </a>

        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", marginBottom: 8 }}>
          Mentions légales
        </h1>
        <p style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", marginBottom: 56 }}>
          Conformément aux articles 6-III et 19 de la loi n° 2004-575 du 21 juin 2004.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Éditeur du site</h2>
            <div style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 2 }}>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Nom :</strong> builderz</p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Forme juridique :</strong> Entrepreneur individuel (immatriculation en cours)</p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>SIRET :</strong> en cours d&apos;attribution</p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Adresse :</strong> 145 rue de Salaison</p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Email :</strong>{" "}
                <a href="mailto:contact@builderz.shop" style={{ color: "#6366f1", textDecoration: "none" }}>contact@builderz.shop</a>
              </p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Directeur de la publication :</strong> builderz</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Hébergement</h2>
            <div style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 2 }}>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Hébergeur :</strong> Google Firebase Hosting</p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Société :</strong> Google LLC</p>
              <p><strong style={{ color: "rgba(226,226,234,0.8)" }}>Adresse :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Propriété intellectuelle</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              L&apos;ensemble du contenu de ce site (textes, images, code, design) est la propriété exclusive de builderz sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Données personnelles</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Les informations collectées via le formulaire de commande sont utilisées exclusivement pour la réalisation de la prestation. Elles ne sont pas cédées à des tiers. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en écrivant à{" "}
              <a href="mailto:contact@builderz.shop" style={{ color: "#6366f1", textDecoration: "none" }}>contact@builderz.shop</a>.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>Cookies et analytics</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.55)", lineHeight: 1.9 }}>
              Ce site utilise Plausible Analytics, un outil de mesure d&apos;audience respectueux de la vie privée (sans cookie, sans données personnelles identifiables). Aucun bandeau de consentement n&apos;est requis.
            </p>
          </section>

        </div>

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20 }}>
          <a href="/" style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}>Accueil</a>
          <a href="/cgv" style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}>CGV</a>
        </div>
      </div>
    </div>
  );
}
