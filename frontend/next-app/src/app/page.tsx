"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LazyVideo } from "@/components/LazyVideo";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};
const stagger = (delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: delay } },
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

/* ── animated counter ── */
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

/* ── tilt card (disabled on mobile) ── */
function TiltCard({ children, style, disabled }: { children: React.ReactNode; style?: React.CSSProperties; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const r = ref.current!.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX: disabled ? 0 : rotateX, rotateY: disabled ? 0 : rotateY, transformStyle: "preserve-3d", transformPerspective: 1000, ...style }}>
      {children}
    </motion.div>
  );
}

/* ── marquee ── */
const TICKER = ["Site Vitrine", "Scrollytelling", "3D / WebGL", "72h livraison", "React · TypeScript", "Agent IA", "€490 / €690 / €990", "100% sur mesure"];
function Marquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "13px 0", background: "rgba(255,255,255,0.015)" }}>
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 24, ease: "linear", repeat: Infinity }}
        style={{ display: "flex", width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 24, padding: "0 24px", fontSize: 12, fontWeight: 500, color: "rgba(226,226,234,0.3)", letterSpacing: "0.04em", whiteSpace: "nowrap", fontFamily: "var(--font-syne)" }}>
            {item}
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#6366F1", flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── browser mockup ── */
const CODE_LINES = [
  { txt: "const Hero = () => {", color: "#818CF8" },
  { txt: "  const [loaded, setLoaded]", color: "rgba(226,226,234,0.5)" },
  { txt: "    = useState(false)", color: "rgba(226,226,234,0.35)" },
  { txt: "", color: "" },
  { txt: "  return (", color: "rgba(226,226,234,0.5)" },
  { txt: "    <motion.div", color: "#06B6D4" },
  { txt: "      initial={{ opacity: 0 }}", color: "rgba(226,226,234,0.4)" },
  { txt: "      animate={{ opacity: 1 }}", color: "rgba(226,226,234,0.4)" },
  { txt: "    >", color: "#06B6D4" },
  { txt: "      <h1>Mon titre</h1>", color: "#6EE7B7" },
  { txt: "    </motion.div>", color: "#06B6D4" },
  { txt: "  )", color: "rgba(226,226,234,0.5)" },
  { txt: "}", color: "#818CF8" },
];

function BrowserMockup() {
  const [phase, setPhase] = useState<"code" | "preview">("code");
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (phase === "code") {
      if (visibleLines < CODE_LINES.length) {
        const t = setTimeout(() => setVisibleLines(v => v + 1), 120);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("preview"), 1800);
        return () => clearTimeout(t);
      }
    } else {
      const t = setTimeout(() => { setPhase("code"); setVisibleLines(0); }, 5000);
      return () => clearTimeout(t);
    }
  }, [phase, visibleLines]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, duration: 0.5 }}
        style={{ position: "absolute", top: -16, left: -16, zIndex: 10, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", fontSize: 11, fontWeight: 600, color: "#06B6D4" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 6px #6EE7B7" }} />
        React · TypeScript
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1, duration: 0.5 }}
        style={{ position: "absolute", bottom: -16, right: -16, zIndex: 10, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11, fontWeight: 600, color: "#10B981" }}>
        ✓ Déployé en 72h
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
            <span style={{ fontSize: 10, color: "rgba(226,226,234,0.25)", fontFamily: "monospace" }}>mon-site.web.app</span>
          </div>
        </div>
        <div style={{ height: 280, position: "relative", overflow: "hidden" }}>
          <motion.div animate={{ opacity: phase === "code" ? 1 : 0 }} transition={{ duration: 0.4 }}
            style={{ position: "absolute", inset: 0, padding: "16px 20px", fontFamily: "monospace", fontSize: 11, lineHeight: 1.7 }}>
            {CODE_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} style={{ color: line.color || "transparent", whiteSpace: "pre" }}>
                {line.txt}
                {i === visibleLines - 1 && phase === "code" && (
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
                    style={{ display: "inline-block", width: 6, height: 12, background: "#6366F1", marginLeft: 2, verticalAlign: "middle" }} />
                )}
              </div>
            ))}
          </motion.div>
          <motion.div animate={{ opacity: phase === "preview" ? 1 : 0 }} transition={{ duration: 0.6 }}
            style={{ position: "absolute", inset: 0, background: "#08080C", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 32, background: "rgba(99,102,241,0.15)", borderBottom: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: "linear-gradient(135deg, #6366F1, #818CF8)" }} />
              <div style={{ height: 6, width: 60, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
              <div style={{ flex: 1 }} />
              {[50, 40, 35].map((w, i) => <div key={i} style={{ height: 6, width: w, borderRadius: 3, background: "rgba(255,255,255,0.07)" }} />)}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20, gap: 10, background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(99,102,241,0.12) 0%, transparent 70%)" }}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: phase === "preview" ? 1 : 0, y: phase === "preview" ? 0 : 10 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <div style={{ height: 8, width: 140, borderRadius: 4, background: "linear-gradient(90deg, #6366F1, #818CF8)", margin: "0 auto 10px" }} />
                <div style={{ height: 5, width: 200, borderRadius: 3, background: "rgba(255,255,255,0.1)", margin: "0 auto 6px" }} />
                <div style={{ height: 5, width: 160, borderRadius: 3, background: "rgba(255,255,255,0.06)", margin: "0 auto 16px" }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <div style={{ height: 24, width: 80, borderRadius: 6, background: "#6366F1" }} />
                  <div style={{ height: 24, width: 70, borderRadius: 6, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              </motion.div>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[1, 2, 3].map(i => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: phase === "preview" ? 1 : 0, y: phase === "preview" ? 0 : 8 }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  style={{ flex: 1, height: 44, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ── site type cards ── */
const TYPES = [
  {
    tag: "01", name: "Site Vitrine", price: "490", color: "#6366F1",
    bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.2)",
    desc: "Landing page premium. Hero animé, sections fluides, optimisé conversion.",
    features: ["Animations Framer Motion", "Design sur mesure", "100% responsive", "Formulaire de contact"],
    video: "/videos/video-hero.mp4",
  },
  {
    tag: "02", name: "Scrollytelling", price: "690", color: "#06B6D4",
    bg: "rgba(6,182,212,0.06)", border: "rgba(6,182,212,0.2)",
    desc: "Narration visuelle déclenchée au scroll. Séquences cinématiques, texte dramatique.",
    features: ["GSAP + Lenis scroll", "Sections pinned", "Typographie XXL", "Révélations au scroll"],
    video: "/videos/video-scrollytelling.mp4",
  },
  {
    tag: "03", name: "3D / WebGL", price: "990", color: "#8B5CF6",
    bg: "rgba(139,92,246,0.07)", border: "rgba(139,92,246,0.25)", featured: true,
    desc: "Expérience immersive Three.js. Scènes 3D, shaders, interactions GPU.",
    features: ["Three.js / R3F", "Particules & shaders", "Curseur custom", "Fallback mobile"],
    video: "/videos/video-3d-webgl.mp4",
  },
];

const STEPS = [
  { n: "01", title: "Remplissez le formulaire", desc: "Décrivez votre activité, vos préférences visuelles et choisissez votre type de site. 5 minutes suffisent.", aside: "Formulaire guidé · 5 étapes" },
  { n: "02", title: "L'IA génère votre site", desc: "Notre agent analyse votre brief et produit un site React complet — code, design, contenu. Tout.", aside: "Agent IA · React · TypeScript" },
  { n: "03", title: "Livraison & mise en ligne", desc: "Vous recevez votre site déployé sur Firebase. URL permanente, SSL inclus, domaine custom possible.", aside: "Firebase Hosting · SSL · 72h" },
];

export default function LandingPage() {
  const [hoveredType, setHoveredType] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const hasVideos = true;

  const px = isMobile ? "18px" : "28px";

  return (
    <div style={{ minHeight: "100vh", background: "#060608", color: "#E2E2EA", overflowX: "hidden", fontFamily: "var(--font-inter), Inter, sans-serif" }}>

      {/* background orbs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb1 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "40%", right: "-15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", filter: "blur(60px)", animation: "orb3 26s ease-in-out infinite" }} />
        <style>{`@keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}@keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,60px)}}@keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-50px)}}`}</style>
      </div>

      {/* nav */}
      <motion.nav initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(6,6,8,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: `0 ${px}`, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(99,102,241,0.4)", flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="7" cy="7" r="1.8" fill="white"/></svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.04em", color: "#fff", fontFamily: "var(--font-syne)" }}>Builderz</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 4 }}>
            {!isMobile && [["#comment", "Comment ça marche"], ["#tarifs", "Tarifs"]].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: 13, color: "rgba(226,226,234,0.4)", textDecoration: "none", padding: "6px 12px", borderRadius: 7, transition: "color 0.15s", whiteSpace: "nowrap" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(226,226,234,0.85)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(226,226,234,0.4)")}>
                {label}
              </a>
            ))}
            {!isMobile && <a href="/login" style={{ fontSize: 13, color: "rgba(226,226,234,0.4)", textDecoration: "none", padding: "6px 12px", whiteSpace: "nowrap" }}>Connexion</a>}
            <a href="/form" style={{ fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", padding: isMobile ? "8px 16px" : "8px 18px", borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #818CF8)", boxShadow: "0 0 20px rgba(99,102,241,0.35)", whiteSpace: "nowrap", fontFamily: "var(--font-syne)" }}>
              {isMobile ? "Créer mon site" : "Démarrer →"}
            </a>
          </div>
        </div>
      </motion.nav>

      {/* ── hero ── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100svh", display: "flex", alignItems: "center", padding: isMobile ? "80px 18px 60px" : "100px 28px 80px", maxWidth: 1200, margin: "0 auto" }}>

        {hasVideos && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
            <video autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, filter: "hue-rotate(200deg) saturate(0.7)" }}>
              <source src="/videos/video-hero.mp4" type="video/mp4" />
            </video>
            <div style={{ position: "absolute", inset: 0, background: isMobile ? "rgba(6,6,8,0.88)" : "linear-gradient(to right, rgba(6,6,8,0.95) 40%, rgba(6,6,8,0.4) 100%)" }} />
          </div>
        )}

        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 0 : 60, alignItems: "center", width: "100%" }}>

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
              <a href="/form" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "12px 22px" : "13px 26px", borderRadius: 9, background: "linear-gradient(135deg, #6366F1, #818CF8)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 32px rgba(99,102,241,0.4)", fontFamily: "var(--font-syne)" }}>
                Créer mon site
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#tarifs" style={{ display: "inline-flex", alignItems: "center", padding: isMobile ? "12px 18px" : "13px 22px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.09)", color: "rgba(226,226,234,0.55)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                Voir les tarifs
              </a>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: "flex", gap: isMobile ? 28 : 36 }}>
              {[{ label: "Délai livraison", to: 72, suffix: "h" }, { label: "Types de sites", to: 3, suffix: "" }, { label: "Satisfaction", to: 100, suffix: "%" }].map(({ label, to, suffix }) => (
                <div key={label}>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(26px, 3vw, 36px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    <Counter to={to} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(226,226,234,0.3)", marginTop: 5, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* browser mockup — desktop only */}
          {!isMobile && (
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              style={{ display: "flex", justifyContent: "flex-end" }}>
              <BrowserMockup />
            </motion.div>
          )}
        </div>
      </section>

      {/* marquee */}
      <div style={{ position: "relative", zIndex: 1 }}><Marquee /></div>

      {/* ── process ── */}
      <section id="comment" style={{ position: "relative", zIndex: 1, padding: isMobile ? "70px 18px" : "110px 28px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger()}>
          <motion.div variants={fadeUp} style={{ marginBottom: isMobile ? 40 : 64 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6366F1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-syne)" }}>Processus</div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(22px, 7vw, 32px)" : "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 520 }}>
              De votre brief à votre site en ligne
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 1 }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.n} variants={fadeUp}
                style={{ padding: isMobile ? "28px 24px" : "36px 32px", background: i === 1 ? "rgba(19,19,28,0.55)" : "transparent", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -16, right: 20, fontFamily: "var(--font-syne)", fontSize: 88, fontWeight: 800, color: "rgba(99,102,241,0.05)", letterSpacing: "-0.06em", lineHeight: 1, userSelect: "none" }}>{step.n}</div>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.1em", marginBottom: 12 }}>{step.n}</div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.3, letterSpacing: "-0.02em" }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(226,226,234,0.42)", lineHeight: 1.75, marginBottom: 18 }}>{step.desc}</p>
                <div style={{ display: "inline-flex", padding: "4px 11px", borderRadius: 99, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.13)", fontSize: 11, color: "rgba(226,226,234,0.35)", fontWeight: 500 }}>{step.aside}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── tarifs ── */}
      <section id="tarifs" style={{ position: "relative", zIndex: 1, padding: isMobile ? "60px 18px 80px" : "80px 28px 110px", background: "rgba(8,8,12,0.6)" }}>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {TYPES.map((type, i) => (
                <motion.div key={type.name} variants={fadeUp}>
                  <TiltCard disabled={isMobile}>
                    <div onMouseEnter={() => !isMobile && setHoveredType(i)} onMouseLeave={() => !isMobile && setHoveredType(null)}
                      style={{ position: "relative", borderRadius: 18, background: hoveredType === i ? type.bg : "rgba(12,12,18,0.9)", border: `1px solid ${hoveredType === i ? type.border : "rgba(255,255,255,0.06)"}`, transition: "all 0.3s ease", overflow: "hidden" }}>

                      {type.featured && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${type.color}, transparent)`, opacity: 0.7 }} />
                      )}

                      {/* layout horizontal sur mobile */}
                      <div style={{ display: isMobile ? "flex" : "block" }}>

                        {/* video/thumb */}
                        <div style={{
                          width: isMobile ? 110 : "100%",
                          minWidth: isMobile ? 110 : undefined,
                          height: isMobile ? "auto" : 140,
                          minHeight: isMobile ? 110 : undefined,
                          overflow: "hidden",
                          background: `linear-gradient(135deg, ${type.color}14 0%, rgba(0,0,0,0) 100%)`,
                          borderRight: isMobile ? `1px solid rgba(255,255,255,0.05)` : "none",
                          borderBottom: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
                          position: "relative",
                          flexShrink: 0,
                        }}>
                          {hasVideos ? (
                            <LazyVideo src={type.video} style={{ width: "100%", height: "100%", objectFit: "cover" }} opacity={0.85} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", minHeight: isMobile ? 110 : undefined, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 80% at 50% 60%, ${type.color}20 0%, transparent 70%)` }} />
                              <div style={{ display: "flex", gap: 6, opacity: 0.4 }}>
                                {[70, 100, 80].map((h, j) => (
                                  <div key={j} style={{ width: 28, height: h, borderRadius: 6, background: `linear-gradient(180deg, ${type.color} 0%, transparent 100%)` }} />
                                ))}
                              </div>
                            </div>
                          )}
                          {type.featured && !isMobile && (
                            <div style={{ position: "absolute", top: 10, right: 10 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: type.color, background: `${type.color}18`, border: `1px solid ${type.color}30`, padding: "3px 9px", borderRadius: 99, letterSpacing: "0.05em" }}>POPULAIRE</span>
                            </div>
                          )}
                        </div>

                        {/* content */}
                        <div style={{ padding: isMobile ? "16px 18px" : "22px 26px", flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>{type.name}</h3>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 2, flexShrink: 0 }}>
                              <span style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? 22 : 32, fontWeight: 700, color: type.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{type.price}</span>
                              <span style={{ fontSize: 12, color: "rgba(226,226,234,0.3)", fontWeight: 500 }}>€</span>
                            </div>
                          </div>

                          <p style={{ fontSize: 12, color: "rgba(226,226,234,0.42)", lineHeight: 1.65, marginBottom: isMobile ? 12 : 20 }}>{type.desc}</p>

                          {!isMobile && (
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                              {type.features.map(f => (
                                <li key={f} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: "rgba(226,226,234,0.55)" }}>
                                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: `${type.color}16`, border: `1px solid ${type.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2L6.5 2" stroke={type.color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          )}

                          {isMobile ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                              {type.features.map(f => (
                                <span key={f} style={{ fontSize: 10, color: type.color, background: `${type.color}12`, border: `1px solid ${type.color}20`, padding: "3px 8px", borderRadius: 99 }}>{f}</span>
                              ))}
                            </div>
                          ) : null}

                          <a href="/form" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: isMobile ? "9px 14px" : "11px 18px", borderRadius: 9, background: `linear-gradient(135deg, ${type.color}, ${type.color}cc)`, color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", fontFamily: "var(--font-syne)" }}>
                            Démarrer
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ position: "relative", zIndex: 1, padding: isMobile ? "70px 18px" : "110px 28px" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger()}
          style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <motion.div variants={fadeUp} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 99, background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.18)", fontSize: 12, color: "#818CF8", fontWeight: 600, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 6px #6EE7B7" }} />
            Disponible maintenant
          </motion.div>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontSize: isMobile ? "clamp(26px, 8vw, 40px)" : "clamp(30px, 4vw, 52px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 14 }}>
            Prêt à avoir un site<br/>qui convertit ?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: isMobile ? 14 : 15, color: "rgba(226,226,234,0.38)", lineHeight: 1.75, marginBottom: 36, maxWidth: 400, margin: "0 auto 36px" }}>
            Remplissez le formulaire en 5 minutes.<br/>L'IA s'occupe du reste.
          </motion.p>
          <motion.div variants={fadeUp}>
            <a href="/form" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: isMobile ? "13px 28px" : "15px 32px", borderRadius: 11, background: "linear-gradient(135deg, #6366F1, #818CF8)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 8px 40px rgba(99,102,241,0.4)", fontFamily: "var(--font-syne)" }}>
              Commander mon site
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8 4l4 3.5L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <div style={{ marginTop: 14, fontSize: 12, color: "rgba(226,226,234,0.22)", letterSpacing: "0.03em" }}>
              Paiement sécurisé · Livraison 72h · Satisfaction garantie
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: `20px ${px}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, background: "linear-gradient(135deg, #6366F1, #818CF8)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="7" cy="7" r="1.8" fill="white"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-syne)", fontSize: 13, fontWeight: 700, color: "rgba(226,226,234,0.4)", letterSpacing: "-0.02em" }}>Builderz</span>
          </div>
          <span style={{ fontSize: 11, color: "rgba(226,226,234,0.18)" }}>© 2025 Builderz · builderz.shop</span>
        </div>
      </footer>
    </div>
  );
}
