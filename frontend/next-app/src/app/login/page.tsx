"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(isAdmin ? "/app" : "/mon-espace");
  }, [user, loading, isAdmin, router]);

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email?.toLowerCase() || "";
      const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sloan.dlrz@gmail.com").toLowerCase();
      router.replace(email === adminEmail ? "/app" : "/mon-espace");
    } catch {
      setError("Connexion annulée ou refusée.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div style={{
        background: "var(--surface2)",
        border: "1px solid var(--bd)",
        borderRadius: 16,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 380,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 18px rgba(99,102,241,0.3)",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
              <circle cx="7" cy="7" r="1.8" fill="white"/>
            </svg>
          </div>
          <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 15 }}>Agent Platform</span>
        </div>

        <h1 style={{ color: "var(--text)", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Connexion</h1>
        <p style={{ color: "var(--muted2)", fontSize: 13, marginBottom: 28 }}>Accédez à votre espace builderz.</p>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <button
          onClick={handleGoogle}
          disabled={submitting}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: "white",
            color: "#1f1f1f",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "11px 16px",
            fontWeight: 600,
            fontSize: 14,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {submitting ? "Connexion..." : "Continuer avec Google"}
        </button>
      </div>
    </div>
  );
}
