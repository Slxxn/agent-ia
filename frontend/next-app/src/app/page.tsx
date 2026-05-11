"use client";

import { useEffect, useRef, useState } from "react";

const SITE_TYPES = [
  {
    name: "Site Vitrine",
    emoji: "✦",
    price: "450",
    color: "#6366F1",
    glow: "rgba(99,102,241,0.25)",
    description: "Landing page professionnelle avec animations fluides, design moderne et conversion optimisée.",
    features: ["Hero animé", "Sections témoignages", "Formulaire de contact", "100% responsive"],
  },
  {
    name: "Site 3D / WebGL",
    emoji: "◈",
    price: "650",
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.25)",
    description: "Expérience immersive avec Three.js, shaders GLSL et interactions 3D qui impressionnent vos visiteurs.",
    features: ["Scènes Three.js", "Animations GPU", "Effets de particules", "Interactions souris"],
  },
  {
    name: "Scrollytelling",
    emoji: "◎",
    price: "550",
    color: "#06B6D4",
    glow: "rgba(6,182,212,0.25)",
    description: "Narration visuelle déclenchée par le scroll — idéal pour raconter une histoire ou présenter un produit.",
    features: ["Animations au scroll", "Pinning de sections", "Transitions cinématiques", "GSAP + Lenis"],
  },
];

const STEPS = [
  { n: "01", title: "Remplissez le formulaire", desc: "Décrivez votre activité, vos préférences visuelles et choisissez votre type de site." },
  { n: "02", title: "L'IA génère votre site", desc: "Notre agent IA produit un site complet avec code React, animations et contenu adapté à votre secteur." },
  { n: "03", title: "Livraison en 72h", desc: "Vous recevez votre site déployé, hébergé et prêt à convertir vos visiteurs en clients." },
];

export default function LandingPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--mx", `${x}%`);
      hero.style.setProperty("--my", `${y}%`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", color: "#E2E2EA", overflowX: "hidden", fontFamily: "inherit" }}>

      {/* ── Nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(8,8,12,0.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30,
              background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 18px rgba(99,102,241,0.35)",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                <circle cx="7" cy="7" r="1.8" fill="white"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#fff" }}>Builderz</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/login" style={{ fontSize: 13, color: "rgba(226,226,234,0.6)", textDecoration: "none", padding: "6px 12px", borderRadius: 7 }}>
              Connexion
            </a>
            <a href="/form" style={{
              fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none",
              padding: "7px 16px", borderRadius: 8,
              background: "linear-gradient(135deg, #6366F1, #818CF8)",
              boxShadow: "0 0 16px rgba(99,102,241,0.4)",
            }}>
              Commander mon site
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        ref={heroRef}
        style={{
          position: "relative", paddingTop: 160, paddingBottom: 120,
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          padding: "160px 24px 120px",
          background: `radial-gradient(ellipse 60% 50% at var(--mx, 50%) var(--my, 40%), rgba(99,102,241,0.12) 0%, transparent 70%), #08080C`,
        }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px", borderRadius: 99,
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
          fontSize: 12, fontWeight: 600, color: "#818CF8",
          marginBottom: 28, letterSpacing: "0.02em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", display: "inline-block", boxShadow: "0 0 6px #6EE7B7" }} />
          Livraison garantie en 72h
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em",
          color: "#fff", maxWidth: 820, marginBottom: 22,
        }}>
          Votre site web pro,{" "}
          <span style={{
            background: "linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #C4B5FD 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            généré par l'IA
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(226,226,234,0.55)",
          maxWidth: 560, lineHeight: 1.7, marginBottom: 40,
        }}>
          Nous créons des sites React premium — vitrine, 3D ou scrollytelling — adaptés à votre activité. Zéro template, 100% sur mesure.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/form" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 10,
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
            boxShadow: "0 0 32px rgba(99,102,241,0.45)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 40px rgba(99,102,241,0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(99,102,241,0.45)"; }}
          >
            Démarrer mon projet
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#tarifs" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(226,226,234,0.8)", fontWeight: 600, fontSize: 15, textDecoration: "none",
          }}>
            Voir les tarifs
          </a>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 40, marginTop: 64, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { v: "72h", l: "Délai de livraison" },
            { v: "3", l: "Types de sites" },
            { v: "100%", l: "Code sur mesure" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{v}</div>
              <div style={{ fontSize: 12, color: "rgba(226,226,234,0.4)", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comment ça marche ── */}
      <section style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Processus</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>Comment ça marche ?</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {STEPS.map((step) => (
            <div key={step.n} style={{
              background: "rgba(19,19,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "28px 26px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", marginBottom: 14 }}>{step.n}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(226,226,234,0.5)", lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tarifs ── */}
      <section id="tarifs" style={{ padding: "96px 24px", background: "rgba(10,10,18,0.6)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Tarifs</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>Choisissez votre site</h2>
            <p style={{ fontSize: 14, color: "rgba(226,226,234,0.45)", marginTop: 12, maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
              Prix fixe, pas de surprise. Hébergement Firebase inclus la première année.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {SITE_TYPES.map((type, i) => (
              <div
                key={type.name}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i ? `rgba(19,19,28,0.95)` : "rgba(14,14,22,0.8)",
                  border: `1px solid ${hovered === i ? type.color + "55" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 18, padding: "32px 28px",
                  transition: "all 0.25s ease",
                  boxShadow: hovered === i ? `0 0 40px ${type.glow}` : "none",
                  cursor: "default",
                  position: "relative", overflow: "hidden",
                }}
              >
                {hovered === i && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${type.color}, transparent)`,
                  }} />
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: `${type.color}18`, border: `1px solid ${type.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: type.color,
                  }}>
                    {type.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{type.name}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: type.color, letterSpacing: "-0.03em" }}>
                      {type.price}<span style={{ fontSize: 14, fontWeight: 600, color: "rgba(226,226,234,0.5)" }}> €</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "rgba(226,226,234,0.5)", lineHeight: 1.7, marginBottom: 20 }}>{type.description}</p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                  {type.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(226,226,234,0.7)" }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: `${type.color}20`, border: `1px solid ${type.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke={type.color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a href="/form" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px 16px", borderRadius: 9, width: "100%",
                  background: hovered === i ? type.color : "rgba(255,255,255,0.05)",
                  border: `1px solid ${hovered === i ? "transparent" : "rgba(255,255,255,0.1)"}`,
                  color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none",
                  transition: "all 0.2s ease",
                  boxShadow: hovered === i ? `0 0 20px ${type.glow}` : "none",
                }}>
                  Démarrer ce projet
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M7 3.5l2.5 2.5L7 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section style={{ padding: "96px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 18 }}>
            Prêt à avoir un site qui convertit ?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(226,226,234,0.5)", lineHeight: 1.7, marginBottom: 36 }}>
            Remplissez le formulaire en 5 minutes. L'IA s'occupe du reste.
          </p>
          <a href="/form" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "15px 32px", borderRadius: 10,
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none",
            boxShadow: "0 0 40px rgba(99,102,241,0.5)",
          }}>
            Commander mon site maintenant
          </a>
          <div style={{ marginTop: 20, fontSize: 12, color: "rgba(226,226,234,0.3)" }}>
            Paiement sécurisé · Livraison en 72h · Satisfaction garantie
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, background: "linear-gradient(135deg, #6366F1, #818CF8)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                <circle cx="7" cy="7" r="1.8" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(226,226,234,0.6)" }}>Builderz</span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(226,226,234,0.25)" }}>© 2025 Builderz · builderz.shop</span>
        </div>
      </footer>
    </div>
  );
}
