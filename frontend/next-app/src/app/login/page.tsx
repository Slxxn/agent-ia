"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const provider = new GoogleAuthProvider();
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sloan.dlrz@gmail.com").toLowerCase();

function PixelLogo() {
  const dots: [number, number, string][] = [
    [3,3,"#6366f1"],[19,3,"#818cf8"],[35,3,"#6366f1"],
    [3,19,"#818cf8"],[19,19,"#6366f1"],[35,19,"#818cf8"],
    [3,35,"#6366f1"],[19,35,"#818cf8"],[35,35,"#6366f1"],
  ];
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      {dots.map(([x, y, c], i) => (
        <rect key={i} x={x} y={y} width="13" height="13" rx="3" fill={c} />
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"choose" | "magic">("choose");
  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace(isAdmin ? "/app" : "/mon-espace");
  }, [user, loading, isAdmin, router]);

  // Handle magic link return
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const savedEmail = window.localStorage.getItem("emailForSignIn") || "";
    if (!savedEmail) { setError("Ouvrez ce lien depuis l'appareil où vous avez fait la demande."); return; }

    signInWithEmailLink(auth, savedEmail, window.location.href)
      .then((result) => {
        window.localStorage.removeItem("emailForSignIn");
        const e = result.user.email?.toLowerCase() || "";
        router.replace(e === ADMIN_EMAIL ? "/app" : "/mon-espace");
      })
      .catch(() => setError("Lien invalide ou expiré. Recommencez."));
  }, [router]);

  async function handleGoogle() {
    setError(""); setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const e = result.user.email?.toLowerCase() || "";
      router.replace(e === ADMIN_EMAIL ? "/app" : "/mon-espace");
    } catch {
      setError("Connexion annulée ou refusée.");
    } finally { setSubmitting(false); }
  }

async function handleMagicLink() {
    if (!email.trim()) return;
    setError(""); setSubmitting(true);
    try {
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: "https://builderz.shop/login",
        handleCodeInApp: true,
      });
      window.localStorage.setItem("emailForSignIn", email.trim());
      setMagicSent(true);
    } catch {
      setError("Impossible d'envoyer le lien. Vérifiez votre email.");
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ background: "var(--surface2)", border: "1px solid var(--bd)", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <PixelLogo />
          <span style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>builderz</span>
        </div>

        <h1 style={{ color: "var(--text)", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Connexion</h1>
        <p style={{ color: "var(--muted2)", fontSize: 13, marginBottom: 28 }}>Accédez à votre espace builderz.</p>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Google */}
            <button onClick={handleGoogle} disabled={submitting} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "white", color: "#1f1f1f", border: "1px solid #e0e0e0", borderRadius: 8, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {submitting ? "Connexion..." : "Continuer avec Google"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
              <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>ou sans compte Google</span>
              <div style={{ flex: 1, height: 1, background: "var(--bd)" }} />
            </div>

            {/* Magic link */}
            <button onClick={() => setMode("magic")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--surface3)", color: "var(--text2)", border: "1px solid var(--bd-bright)", borderRadius: 8, padding: "11px 16px", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
              ✉️ Recevoir un lien par email
            </button>
          </div>
        )}

        {mode === "magic" && !magicSent && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              autoFocus
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleMagicLink()}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid var(--bd-bright)", background: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button onClick={handleMagicLink} disabled={submitting || !email.trim()} style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "none", background: "var(--primary)", color: "white", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting || !email.trim() ? 0.6 : 1 }}>
              {submitting ? "Envoi…" : "Envoyer le lien magique"}
            </button>
            <button onClick={() => setMode("choose")} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", textAlign: "center" }}>
              ← Retour
            </button>
          </div>
        )}

        {magicSent && (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
            <p style={{ color: "var(--text)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Lien envoyé !</p>
            <p style={{ color: "var(--muted2)", fontSize: 13, lineHeight: 1.6 }}>
              Vérifiez votre boîte <strong style={{ color: "var(--text2)" }}>{email}</strong> et cliquez sur le lien pour vous connecter.
            </p>
            <button onClick={() => { setMagicSent(false); setMode("choose"); }} style={{ marginTop: 16, background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>
              ← Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
