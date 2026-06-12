"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const RubiksCube3D = dynamic(() => import("@/components/RubiksCube3D"), { ssr: false, loading: () => null });

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const stagger = (delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});

const PHONE = "+33 6 95 62 43 74";
const PHONE_TEL = "+33695624374";
const WA_NUMBER = "33695624374";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const TICKER_ITEMS = [
  "Site Vitrine", "Sous 5 jours", "à partir de 290€", "100% sur mesure",
  "Responsive mobile", "SSL inclus", "Domaine custom", "Formulaire de contact",
  "30 jours de retouches", "Hébergement inclus",
];

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "13px 0", background: "rgba(255,255,255,0.015)" }}>
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        style={{ display: "flex", width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 24, padding: "0 24px", fontSize: 12, fontWeight: 500, color: "rgba(226,226,234,0.28)", letterSpacing: "0.04em", whiteSpace: "nowrap", fontFamily: "var(--font-syne)" }}>
            {item}
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#6366F1", flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const PixelLogo = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: "px1 3.2s ease-in-out infinite" }}/>
    <rect x="19" y="3" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: "px2 2.8s ease-in-out infinite" }}/>
    <rect x="35" y="3" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: "px3 3.5s ease-in-out infinite" }}/>
    <rect x="3" y="19" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: "px4 2.6s ease-in-out infinite" }}/>
    <rect x="19" y="19" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: "px5 3.8s ease-in-out infinite" }}/>
    <rect x="35" y="19" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: "px6 2.9s ease-in-out infinite" }}/>
    <rect x="3" y="35" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: "px7 3.1s ease-in-out infinite" }}/>
    <rect x="19" y="35" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: "px8 2.7s ease-in-out infinite" }}/>
    <rect x="35" y="35" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: "px9 3.4s ease-in-out infinite" }}/>
  </svg>
);

const STEPS = [
  {
    n: "01",
    title: "Remplissez le formulaire",
    desc: "Décrivez votre activité en 5 minutes : secteur, style visuel, infos de contact. Aucune compétence technique requise.",
    tag: "Formulaire guidé · 5 minutes",
  },
  {
    n: "02",
    title: "Nous créons votre site",
    desc: "Votre site est conçu sur mesure — design, contenu, mise en page — avec l'aide de notre IA, supervisé par un expert. Vous validez avant la mise en ligne.",
    tag: "Design sur mesure · Supervisé par un expert",
  },
  {
    n: "03",
    title: "Mise en ligne sous 5 jours",
    desc: "Votre site est déployé sur un hébergement professionnel. URL permanente, SSL inclus, domaine personnalisé possible. 30 jours de retouches incluses.",
    tag: "Hébergement Google · SSL inclus · Domaine custom",
  },
];

const INCLUDED_FEATURES = [
  "Site vitrine une page, sur mesure",
  "Design adapté à votre activité",
  "100% responsive (mobile, tablette, ordi)",
  "Formulaire de contact intégré",
  "Hébergement + SSL inclus",
  "Mise en ligne sous 5 jours",
  "30 jours de retouches incluses",
  "Code source livré",
];

const OPTION_ITEMS = [
  { label: "Pages supplémentaires", desc: "Menu, équipe, galerie, blog…" },
  { label: "Prise de rendez-vous en ligne", desc: "Réservation et agenda intégré" },
  { label: "Nom de domaine personnalisé", desc: ".fr, .com selon votre activité" },
  { label: "Animations avancées", desc: "Effets au défilement, transitions cinématiques" },
  { label: "Expérience 3D immersive", desc: "Scènes interactives, effets visuels uniques" },
  { label: "Référencement Google renforcé", desc: "Optimisation technique SEO avancée" },
  { label: "Site multilingue", desc: "Français, anglais et autres langues" },
];

const FAQ_ITEMS = [
  {
    q: "Combien de temps faut-il pour recevoir mon site ?",
    a: "La livraison est garantie sous 5 jours ouvrés après validation de votre brief. La plupart des sites sont livrés en 3 à 4 jours.",
  },
  {
    q: "Que comprend le site à 290€ ?",
    a: "Un site une page professionnel sur mesure : design adapté à votre activité, animations élégantes et fluides, 100% responsive (mobile, tablette, ordinateur), formulaire de contact, hébergement et SSL inclus. Mise en ligne sous 5 jours.",
  },
  {
    q: "Combien coûtent les options ?",
    a: "Les options (pages supplémentaires, réservation en ligne, domaine personnalisé…) sont sur devis. La plupart des projets avec options se situent entre 290€ et 600€. Vous recevez un devis sous 48h après votre demande.",
  },
  {
    q: "Est-ce que je peux modifier le site après livraison ?",
    a: "30 jours de retouches incluses : jusqu'à 3 demandes groupées portant sur les textes, images, couleurs, coordonnées et petits ajustements. Les nouvelles pages ou fonctionnalités sont disponibles en option.",
  },
  {
    q: "Est-ce que mon site sera vraiment unique ?",
    a: "Oui. Chaque site est conçu sur mesure à partir de votre brief, avec l'aide de notre IA supervisée par un expert. Aucun template, aucune copie.",
  },
  {
    q: "Puis-je voir des exemples de réalisations ?",
    a: "Oui, consultez la section Réalisations sur cette page. D'autres exemples sont disponibles sur demande à contact@builderz.shop.",
  },
];

function CheckIcon() {
  return (
    <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2L6.5 2" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E2EA", lineHeight: 1.4 }}>{q}</span>
        <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(226,226,234,0.4)", fontSize: 14, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          style={{ paddingBottom: 20, fontSize: 13, color: "rgba(226,226,234,0.45)", lineHeight: 1.75 }}>
          {a}
        </motion.div>
      )}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.6 21 3 14.4 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
    </svg>
  );
}

function track(event: string) {
  (window as unknown as { plausible?: (e: string) => void }).plausible?.(event);
}

export default function LandingPage() {
  const isMobile = useIsMobile();
  const px = isMobile ? "18px" : "28px";

  return (
    <div style={{ minHeight: "100dvh", background: "#060608", color: "#E2E2EA", overflowX: "hidden", fontFamily: "var(--font-inter), Inter, sans-serif" }}>

      {/* background orbs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb1 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "40%", right: "-15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)", filter: "blur(60px)", animation: "orb3 26s ease-in-out infinite" }} />
        <style>{`@keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}@keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,60px)}}@keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-50px)}}`}</style>
      </div>

      {/* ── nav ── */}
      <motion.nav initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(6,6,8,0.88)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${px}`, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
            <PixelLogo size={26} />
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.04em", color: "#fff", fontFamily: "var(--font-syne)" }}>builderz</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 2 }}>
            {isMobile && (
              <a href={`tel:${PHONE_TEL}`} onClick={() => track("click_phone")} aria-label="Appeler builderz"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.09)", color: "rgba(226,226,234,0.6)", marginRight: 6 }}>
                <PhoneIcon />
              </a>
            )}
            {!isMobile && (
              <>
                {[["#comment", "Comment ça marche"], ["#realisations", "Réalisations"], ["#tarifs", "Tarifs"]].map(([href, label]) => (
                  <a key={href} href={href} style={{ fontSize: 13, color: "rgba(226,226,234,0.4)", textDecoration: "none", padding: "6px 12px", borderRadius: 7, transition: "color 0.15s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(226,226,234,0.85)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(226,226,234,0.4)")}>
                    {label}
                  </a>
                ))}
                <a href={`tel:${PHONE_TEL}`} onClick={() => track("click_phone")}
                  style={{ fontSize: 13, color: "rgba(226,226,234,0.45)", textDecoration: "none", padding: "6px 12px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                  <PhoneIcon />{PHONE}
                </a>
                <a href="/login" style={{ fontSize: 13, color: "rgba(226,226,234,0.35)", textDecoration: "none", padding: "6px 12px", whiteSpace: "nowrap" }}>Connexion</a>
              </>
            )}
            <a href="/form" onClick={() => track("click_cta_nav")}
              style={{ fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", padding: isMobile ? "8px 16px" : "8px 20px", borderRadius: 8, background: "#6366f1", whiteSpace: "nowrap" }}>
              Créer mon site →
            </a>
          </div>
        </div>
      </motion.nav>

      {/* ── hero ── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100dvh" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: isMobile ? "96px 18px 60px" : "100px 28px 80px", display: "flex", alignItems: "center", minHeight: "100dvh" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 64, alignItems: "center", width: "100%" }}>

            <motion.div initial="hidden" animate="visible" variants={stagger(0.1)}>
              {/* cube en vidéo sur mobile (léger), WebGL sur desktop — comme resend.com */}
              {isMobile && (
                <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <video
                    autoPlay loop muted playsInline aria-hidden="true"
                    poster="/cube-poster.jpg" src="/cube.mp4"
                    width={200} height={200}
                    style={{ width: 200, height: 200, objectFit: "cover", display: "block" }}
                  />
                </motion.div>
              )}
              <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 7px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", marginBottom: 24, width: "fit-content" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#6366F1", borderRadius: 99, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 5px #6EE7B7" }} />
                  DISPONIBLE
                </span>
                <span style={{ fontSize: 12, color: "rgba(226,226,234,0.55)", fontWeight: 500 }}>Sites web pro, créés avec l&apos;IA</span>
              </motion.div>

              <motion.h1 variants={fadeUp}
                style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(32px, 9vw, 44px)" : "clamp(36px, 4.5vw, 60px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#fff", marginBottom: 0 }}>
                Votre site web pro,{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ background: "linear-gradient(135deg, #818CF8 0%, #6366F1 40%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    sous 5 jours.
                  </span>
                  <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
                    style={{ position: "absolute", bottom: 3, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #6366F1, #06B6D4)", borderRadius: 2, transformOrigin: "left", display: "block" }} />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: isMobile ? 14 : 15, color: "rgba(226,226,234,0.45)", lineHeight: 1.75, marginTop: 18, marginBottom: 28, maxWidth: 440 }}>
                Nous créons votre site web professionnel sur mesure, adapté à votre activité — design, contenu, mise en ligne. À partir de 290€.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 40 }}>
                <a href="/form" onClick={() => track("click_cta_hero")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 22px" : "13px 26px", borderRadius: 9, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "var(--font-syne)" }}>
                  Créer mon site
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                <a href="#tarifs" style={{ display: "inline-flex", alignItems: "center", padding: isMobile ? "12px 18px" : "13px 22px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.09)", color: "rgba(226,226,234,0.55)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  Voir les tarifs
                </a>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: "flex", gap: isMobile ? 20 : 32, flexWrap: "wrap" }}>
                {[
                  { value: "Sous 5 jours", label: "Livraison garantie" },
                  { value: "100% sur mesure", label: "Aucun template" },
                  { value: "30 jours", label: "Retouches incluses" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? 14 : 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(226,226,234,0.3)", marginTop: 5, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* cube 3D — desktop only */}
            {!isMobile && (
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
                style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div style={{ position: "absolute", inset: -60, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
                  <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.4 }}
                    style={{ position: "absolute", top: 6, right: -8, zIndex: 10, display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 99, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", fontSize: 11, fontWeight: 600, color: "#22C55E" }}>
                    ✓ Livré sous 5 jours
                  </motion.div>
                  <div style={{ width: 540, height: 540 }}>
                    <RubiksCube3D />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* marquee */}
      <div style={{ position: "relative", zIndex: 1 }}><Marquee /></div>

      {/* ── réalisations ── */}
      <section id="realisations" style={{ position: "relative", zIndex: 1, padding: isMobile ? "70px 18px" : "100px 28px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger()}>
          <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? 36 : 56 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-syne)" }}>Réalisations</div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Sites créés par builderz
            </h2>
          </motion.div>

          {/* IXSHEL&CO — carte élargie */}
          <motion.div variants={fadeUp}>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#0E0E15", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              <div style={{ height: isMobile ? 220 : 340, overflow: "hidden", position: "relative", background: "#0a0a12" }}>
                <img
                  src="/realisations/ixshel-co.jpg"
                  alt="IXSHEL&CO — site vitrine bijoux"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                />
              </div>
              <div style={{ padding: isMobile ? "24px 20px" : "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 20, color: "#fff" }}>IXSHEL&CO</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#6366F1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "2px 8px", borderRadius: 99 }}>SITE VITRINE</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(226,226,234,0.45)", lineHeight: 1.75, marginBottom: 20 }}>
                  Site vitrine pour une créatrice de bijoux artisanaux. Design sur mesure, mise en valeur des collections, formulaire de contact. Livré sous 5 jours.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {[
                    "Design adapté à l'univers bijoux artisanaux",
                    "100% responsive — mobile et desktop",
                    "Animations élégantes et fluides",
                  ].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(226,226,234,0.45)" }}>
                      <CheckIcon />{f}
                    </div>
                  ))}
                </div>
                <a href="https://ixshel-co.web.app" target="_blank" rel="noopener noreferrer"
                  onClick={() => track("click_realisation")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6366F1", textDecoration: "none", fontWeight: 600 }}>
                  Voir le site →
                </a>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ── process ── */}
      <section id="comment" style={{ position: "relative", zIndex: 1, padding: isMobile ? "60px 18px" : "100px 28px", background: "rgba(8,8,12,0.5)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger()}>
            <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? 40 : 60 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-syne)" }}>Processus</div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 520 }}>
                De votre brief à votre site en ligne
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
              {STEPS.map((step, i) => (
                <motion.div key={step.n} variants={fadeUp}
                  style={{ padding: "32px 28px", background: i === 1 ? "rgba(19,19,28,0.7)" : "rgba(14,14,21,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: 16, fontFamily: "var(--font-syne)", fontSize: 96, fontWeight: 800, color: "rgba(99,102,241,0.04)", letterSpacing: "-0.06em", lineHeight: 1, userSelect: "none" }}>{step.n}</div>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.1em", marginBottom: 14 }}>{step.n}</div>
                  <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(226,226,234,0.42)", lineHeight: 1.75, marginBottom: 20 }}>{step.desc}</p>
                  <div style={{ display: "inline-flex", padding: "4px 11px", borderRadius: 99, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.13)", fontSize: 11, color: "rgba(226,226,234,0.35)", fontWeight: 500 }}>{step.tag}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── tarifs ── */}
      <section id="tarifs" style={{ position: "relative", zIndex: 1, padding: isMobile ? "60px 18px 80px" : "100px 28px 110px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger()}>
            <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? 36 : 56 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-syne)" }}>Tarifs</div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>
                Un site pro. Un prix clair.
              </h2>
              <p style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", lineHeight: 1.7 }}>
                Prix fixe, livraison garantie sous 5 jours. Hébergement inclus.
              </p>
            </motion.div>

            {/* Carte principale 290€ */}
            <motion.div variants={fadeUp}>
              <div style={{ position: "relative", borderRadius: 20, background: "rgba(12,12,18,0.9)", border: "1px solid rgba(99,102,241,0.35)", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #6366f1, transparent)" }} />
                <div style={{ padding: isMobile ? "28px 22px" : "40px 44px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6366F1", marginBottom: 8 }}>VOTRE SITE WEB PRO</div>
                      <h3 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>Site vitrine one-page</h3>
                      <p style={{ fontSize: 13, color: "rgba(226,226,234,0.4)", marginTop: 10, lineHeight: 1.65, maxWidth: 400 }}>
                        Sur mesure, adapté à votre activité et votre clientèle. Aucun template, aucune copie.
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? 46 : 56, fontWeight: 700, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                        290<span style={{ fontSize: 22, color: "rgba(226,226,234,0.45)", fontWeight: 500 }}>€</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(226,226,234,0.3)", marginTop: 4 }}>prix fixe · tout inclus</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 12, marginBottom: 32 }}>
                    {INCLUDED_FEATURES.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(226,226,234,0.65)" }}>
                        <CheckIcon />{f}
                      </div>
                    ))}
                  </div>

                  <a href="/form" onClick={() => track("click_cta_pricing")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 24px" : "13px 28px", borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "var(--font-syne)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#5558e8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#6366f1")}>
                    Démarrer à 290€ →
                  </a>
                  <div style={{ marginTop: 14, fontSize: 11, color: "rgba(226,226,234,0.18)", letterSpacing: "0.04em" }}>
                    Technologie : React · Hébergement Google Firebase · SSL
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Options */}
            <motion.div variants={fadeUp} style={{ marginTop: 44 }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6, letterSpacing: "-0.02em" }}>Options selon vos besoins</h3>
                <p style={{ fontSize: 13, color: "rgba(226,226,234,0.3)" }}>Sur devis — nous vous répondons sous 48h.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10 }}>
                {OPTION_ITEMS.map(opt => (
                  <div key={opt.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(14,14,21,0.5)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(99,102,241,0.5)", flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(226,226,234,0.75)", marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(226,226,234,0.3)" }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 18, padding: "16px 20px", borderRadius: 10, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)", fontSize: 13, color: "rgba(226,226,234,0.45)", lineHeight: 1.7 }}>
                La plupart des projets avec options se situent entre{" "}
                <strong style={{ color: "rgba(226,226,234,0.75)" }}>290€ et 600€</strong>.{" "}
                Devis précis sous 48h après votre demande.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ position: "relative", zIndex: 1, padding: isMobile ? "60px 18px" : "100px 28px", background: "#0d0d14" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger()}>
            <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? 36 : 52, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-syne)" }}>FAQ</div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Questions fréquentes
              </h2>
            </motion.div>
            <motion.div variants={fadeUp}>
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} {...item} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ position: "relative", zIndex: 1, padding: isMobile ? "70px 18px" : "100px 28px" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger()}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 99, background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.18)", fontSize: 12, color: "#818CF8", fontWeight: 600, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 6px #6EE7B7" }} />
            Disponible maintenant
          </motion.div>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(26px, 8vw, 38px)" : "clamp(28px, 3.5vw, 46px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
            Prêt à avoir un site<br/>qui convertit ?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: isMobile ? 14 : 15, color: "rgba(226,226,234,0.38)", lineHeight: 1.75, marginBottom: 32, maxWidth: 380, margin: "0 auto 32px" }}>
            Remplissez le formulaire en 5 minutes.<br/>Nous nous occupons du reste.
          </motion.p>
          <motion.div variants={fadeUp}>
            <a href="/form" onClick={() => track("click_cta_final")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 24px" : "13px 28px", borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "var(--font-syne)" }}>
              Commander mon site
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 4l4 3.5L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <div style={{ marginTop: 14, fontSize: 12, color: "rgba(226,226,234,0.2)", letterSpacing: "0.03em" }}>
              Paiement sécurisé · Livraison sous 5 jours ·{" "}
              <a href="/cgv" style={{ color: "inherit", textDecoration: "underline" }}>30 jours de retouches incluses</a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── footer ── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: isMobile ? "40px 18px" : "48px 28px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 32 : 40 }}>

          {/* col 1 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <PixelLogo size={24} />
              <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, letterSpacing: "-0.04em", color: "#fff" }}>builderz</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(226,226,234,0.3)", lineHeight: 1.75, maxWidth: 240 }}>
              Sites web professionnels sur mesure, livrés sous 5 jours pour les TPE et PME.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <a href={`tel:${PHONE_TEL}`} onClick={() => track("click_phone")}
                style={{ fontSize: 12, color: "rgba(226,226,234,0.35)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                <PhoneIcon />{PHONE}
              </a>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                onClick={() => track("click_whatsapp")}
                style={{ fontSize: 12, color: "rgba(226,226,234,0.35)", textDecoration: "none" }}>
                WhatsApp
              </a>
              <a href="mailto:contact@builderz.shop"
                style={{ fontSize: 12, color: "rgba(226,226,234,0.35)", textDecoration: "none" }}>
                contact@builderz.shop
              </a>
            </div>
          </div>

          {/* col 2 */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(226,226,234,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Navigation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["#comment", "Comment ça marche"], ["#realisations", "Réalisations"], ["#tarifs", "Tarifs"], ["/form", "Commander mon site"]].map(([href, label]) => (
                <a key={href} href={href} style={{ fontSize: 13, color: "rgba(226,226,234,0.35)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(226,226,234,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(226,226,234,0.35)")}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* col 3 */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(226,226,234,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Légal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 12, color: "rgba(226,226,234,0.25)" }}>© {new Date().getFullYear()} builderz</span>
              <span style={{ fontSize: 12, color: "rgba(226,226,234,0.25)" }}>builderz.shop</span>
              <a href="/mentions-legales" style={{ fontSize: 12, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(226,226,234,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(226,226,234,0.3)")}>
                Mentions légales
              </a>
              <a href="/cgv" style={{ fontSize: 12, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(226,226,234,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(226,226,234,0.3)")}>
                Conditions générales de vente
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
