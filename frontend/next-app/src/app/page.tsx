"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const stagger = (delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});

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

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 18 });
  const [display, setDisplay] = useState(0);
  useEffect(() => { if (inView) mv.set(to); }, [inView, mv, to]);
  useEffect(() => spring.on("change", v => setDisplay(Math.round(v))), [spring]);
  return <span ref={ref}>{display}{suffix}</span>;
}

const TICKER_ITEMS = [
  "Site Vitrine", "Scrollytelling", "3D / WebGL", "72h livraison",
  "React", "TypeScript", "à partir de 290€", "100% sur mesure",
  "Firebase Hosting", "SSL inclus", "Domaine custom",
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
    <rect x="3" y="3" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px1 3.2s ease-in-out infinite' }}/>
    <rect x="19" y="3" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px2 2.8s ease-in-out infinite' }}/>
    <rect x="35" y="3" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px3 3.5s ease-in-out infinite' }}/>
    <rect x="3" y="19" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px4 2.6s ease-in-out infinite' }}/>
    <rect x="19" y="19" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px5 3.8s ease-in-out infinite' }}/>
    <rect x="35" y="19" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px6 2.9s ease-in-out infinite' }}/>
    <rect x="3" y="35" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px7 3.1s ease-in-out infinite' }}/>
    <rect x="19" y="35" width="13" height="13" rx="3" fill="#818cf8" style={{ animation: 'px8 2.7s ease-in-out infinite' }}/>
    <rect x="35" y="35" width="13" height="13" rx="3" fill="#6366f1" style={{ animation: 'px9 3.4s ease-in-out infinite' }}/>
  </svg>
);

const STEPS = [
  { n: "01", title: "Remplissez le formulaire", desc: "Décrivez votre activité, vos préférences visuelles et choisissez votre type de site. 5 minutes suffisent.", tag: "Formulaire guidé · 5 étapes" },
  { n: "02", title: "L'IA génère votre site", desc: "Notre agent analyse votre brief et produit un site React complet — code, design, contenu. Tout.", tag: "Agent IA · React · TypeScript" },
  { n: "03", title: "Livraison & mise en ligne", desc: "Vous recevez votre site déployé sur Firebase. URL permanente, SSL inclus, domaine custom possible.", tag: "Firebase Hosting · SSL · 72h" },
];

const PRICING = [
  {
    tag: "STANDARD", name: "Site Vitrine", price: "290",
    color: "#6366F1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.2)",
    desc: "Landing page premium. Hero animé, sections fluides, optimisé conversion.",
    features: ["Animations Framer Motion", "Design sur mesure", "100% responsive", "Formulaire de contact"],
  },
  {
    tag: "NARRATIF", name: "Scrollytelling", price: "490",
    color: "#6366F1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.2)",
    desc: "Narration visuelle déclenchée au scroll. Séquences cinématiques, typographie XXL.",
    features: ["GSAP + Lenis scroll", "Sections pinned", "Typographie XXL", "Révélations au scroll"],
    featured: true,
  },
  {
    tag: "IMMERSIF", name: "3D / WebGL", price: "690",
    color: "#6366F1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.2)",
    desc: "Expérience immersive Three.js. Scènes 3D, shaders, interactions GPU.",
    features: ["Three.js / R3F", "Particules & shaders", "Curseur custom", "Fallback mobile"],
  },
];

const FAQ_ITEMS = [
  { q: "Combien de temps faut-il pour recevoir mon site ?", a: "La livraison est garantie en 72h ouvrées après validation du formulaire. La plupart des sites sont livrés en 48h." },
  { q: "Est-ce que je peux modifier le site après livraison ?", a: "Oui. Vous recevez le code source complet en React. Vous pouvez le modifier vous-même ou nous demander des retouches." },
  { q: "Qu'est-ce qui est inclus dans le prix ?", a: "Conception, développement, déploiement Firebase, SSL, et un nom de domaine .web.app. Le domaine custom est en option." },
  { q: "Les sites sont-ils vraiment faits par IA ?", a: "Oui — notre agent génère le code React/TypeScript à partir de votre brief. Chaque site est unique, aucun template." },
  { q: "Quelle est la différence entre les 3 formules ?", a: "Standard = site vitrine classique. Narratif = narration au scroll (GSAP). Immersif = expérience 3D/WebGL (Three.js). Le niveau technique et visuel monte en gamme." },
  { q: "Puis-je voir des exemples de sites générés ?", a: "Oui, consultez la section Réalisations sur cette page. D'autres exemples sont disponibles sur demande." },
];

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
            {!isMobile && (
              <>
                {[["#comment", "Comment ça marche"], ["#realisations", "Réalisations"], ["#tarifs", "Tarifs"]].map(([href, label]) => (
                  <a key={href} href={href} style={{ fontSize: 13, color: "rgba(226,226,234,0.4)", textDecoration: "none", padding: "6px 12px", borderRadius: 7, transition: "color 0.15s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(226,226,234,0.85)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(226,226,234,0.4)")}>
                    {label}
                  </a>
                ))}
                <a href="/login" style={{ fontSize: 13, color: "rgba(226,226,234,0.35)", textDecoration: "none", padding: "6px 12px", whiteSpace: "nowrap" }}>Connexion</a>
              </>
            )}
            <a href="/form" style={{ fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", padding: isMobile ? "8px 16px" : "8px 20px", borderRadius: 8, background: "#6366f1", whiteSpace: "nowrap" }}>
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
              <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 7px", borderRadius: 99, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", marginBottom: 24, width: "fit-content" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#6366F1", borderRadius: 99, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 5px #6EE7B7" }} />
                  NOUVEAU
                </span>
                <span style={{ fontSize: 12, color: "rgba(226,226,234,0.55)", fontWeight: 500 }}>Sites React premium générés par IA</span>
              </motion.div>

              <motion.h1 variants={fadeUp}
                style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(32px, 9vw, 44px)" : "clamp(36px, 4.5vw, 60px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#fff", marginBottom: 0 }}>
                Votre site web pro,{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ background: "linear-gradient(135deg, #818CF8 0%, #6366F1 40%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    livré en 72h.
                  </span>
                  <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
                    style={{ position: "absolute", bottom: 3, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #6366F1, #06B6D4)", borderRadius: 2, transformOrigin: "left", display: "block" }} />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: isMobile ? 14 : 15, color: "rgba(226,226,234,0.45)", lineHeight: 1.75, marginTop: 18, marginBottom: 28, maxWidth: 440 }}>
                Nous utilisons un agent IA pour créer des sites React professionnels, sur mesure, adaptés à votre secteur — sans template, sans compromis.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 40 }}>
                <a href="/form" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 22px" : "13px 26px", borderRadius: 9, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "var(--font-syne)" }}>
                  Créer mon site
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
                <a href="#tarifs" style={{ display: "inline-flex", alignItems: "center", padding: isMobile ? "12px 18px" : "13px 22px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.09)", color: "rgba(226,226,234,0.55)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                  Voir les tarifs
                </a>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: "flex", gap: isMobile ? 28 : 36 }}>
                {[{ label: "Délai livraison", to: 72, suffix: "h" }, { label: "Sites livrés", to: 12, suffix: "+" }, { label: "Satisfaction", to: 100, suffix: "%" }].map(({ label, to, suffix }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(26px, 3vw, 36px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      <Counter to={to} suffix={suffix} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(226,226,234,0.3)", marginTop: 5, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* iframe preview — desktop only */}
            {!isMobile && (
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
                style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
                  <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />
                  <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.4 }}
                    style={{ position: "absolute", top: -14, right: -14, zIndex: 10, display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 99, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.22)", fontSize: 11, fontWeight: 600, color: "#22C55E" }}>
                    ✓ Déployé en 48h
                  </motion.div>
                  <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#0D0D14", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "#13131C", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
                        ))}
                      </div>
                      <div style={{ flex: 1, height: 22, borderRadius: 5, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 10px", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                        <span style={{ fontSize: 10, color: "rgba(226,226,234,0.25)", fontFamily: "monospace" }}>ixshel-co.web.app</span>
                      </div>
                    </div>
                    <div style={{ height: 340, overflow: "hidden", position: "relative" }}>
                      <iframe
                        src="https://agent-ia-2d81a-p51.firebaseapp.com/"
                        style={{ width: "180%", height: "180%", border: "none", pointerEvents: "none", transformOrigin: "top left", transform: "scale(0.556)", position: "absolute", top: 0, left: 0 }}
                        loading="lazy"
                        title="Exemple de site généré par builderz"
                      />
                    </div>
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

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>

            {/* IXSHEL&CO */}
            <motion.div variants={fadeUp}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#0E0E15" }}>
                <div style={{ height: 200, overflow: "hidden", position: "relative", background: "#0a0a12" }}>
                  <iframe
                    src="https://agent-ia-2d81a-p51.firebaseapp.com/"
                    style={{ width: "200%", height: "200%", border: "none", pointerEvents: "none", transformOrigin: "top left", transform: "scale(0.5)", position: "absolute", top: 0, left: 0 }}
                    loading="lazy"
                    title="IXSHEL&CO"
                  />
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, color: "#fff" }}>IXSHEL&CO</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#6366F1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", padding: "2px 8px", borderRadius: 99 }}>STANDARD</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(226,226,234,0.4)", lineHeight: 1.6, marginBottom: 14 }}>Site vitrine — bijoux artisanaux. Livré en 48h.</p>
                  <a href="https://agent-ia-2d81a-p51.firebaseapp.com/" target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "#6366F1", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    Voir le site →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Bientôt 1 */}
            {[1, 2].map(i => (
              <motion.div key={i} variants={fadeUp}>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", background: "#0E0E15", height: "100%", minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(226,226,234,0.25)", marginBottom: 6 }}>Bientôt</div>
                    <div style={{ fontSize: 11, color: "rgba(226,226,234,0.15)" }}>Prochain site livré</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger()}>
            <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? 36 : 56 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-syne)" }}>Tarifs</div>
              <h2 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>
                Choisissez votre site
              </h2>
              <p style={{ fontSize: 13, color: "rgba(226,226,234,0.3)", lineHeight: 1.7 }}>
                Prix fixe, livraison garantie en 72h. Hébergement Firebase inclus.
              </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
              {PRICING.map((plan) => (
                <motion.div key={plan.name} variants={fadeUp}>
                  <div style={{ position: "relative", borderRadius: 18, background: "rgba(12,12,18,0.9)", border: `1px solid ${plan.featured ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)"}`, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                    {plan.featured && (
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #6366f1, transparent)" }} />
                    )}
                    <div style={{ padding: "26px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6366F1", marginBottom: 6 }}>{plan.tag}</div>
                          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>{plan.name}</h3>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 10, color: "rgba(226,226,234,0.3)", marginBottom: 2 }}>à partir de</div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                            <span style={{ fontFamily: "var(--font-syne)", fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{plan.price}</span>
                            <span style={{ fontSize: 13, color: "rgba(226,226,234,0.4)", fontWeight: 500 }}>€</span>
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: 13, color: "rgba(226,226,234,0.42)", lineHeight: 1.65, marginBottom: 20 }}>{plan.desc}</p>

                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                        {plan.features.map(f => (
                          <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(226,226,234,0.55)" }}>
                            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2L6.5 2" stroke="#6366f1" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <a href="/form" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 16px", borderRadius: 9, background: "#6366f1", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", fontFamily: "var(--font-syne)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#5558e8")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#6366f1")}>
                        Démarrer →
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
            Remplissez le formulaire en 5 minutes.<br/>L&apos;IA s&apos;occupe du reste.
          </motion.p>
          <motion.div variants={fadeUp}>
            <a href="/form" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 24px" : "13px 28px", borderRadius: 10, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "var(--font-syne)" }}>
              Commander mon site
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 4l4 3.5L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <div style={{ marginTop: 14, fontSize: 12, color: "rgba(226,226,234,0.2)", letterSpacing: "0.03em" }}>
              Paiement sécurisé · Livraison 72h · Satisfaction garantie
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
              Sites web professionnels générés par IA en 72h pour les TPE/PME.
            </p>
          </div>

          {/* col 2 */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(226,226,234,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Liens</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["#comment", "Comment ça marche"], ["#realisations", "Réalisations"], ["#tarifs", "Tarifs"], ["/form", "Commander"]].map(([href, label]) => (
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
              <span style={{ fontSize: 12, color: "rgba(226,226,234,0.25)" }}>© 2025 builderz</span>
              <span style={{ fontSize: 12, color: "rgba(226,226,234,0.25)" }}>builderz.shop</span>
              <a href="mailto:contact@builderz.shop" style={{ fontSize: 12, color: "rgba(226,226,234,0.3)", textDecoration: "none" }}>contact@builderz.shop</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
