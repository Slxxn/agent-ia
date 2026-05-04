"use client";

import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthProvider, useAuth } from "@/lib/authContext";
import AuthGuard from "@/lib/AuthGuard";

const PUBLIC_ROUTES = ["/form", "/login"];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  if (isPublic) return <>{children}</>;

  return (
    <AuthGuard>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            background: "rgba(8,8,12,0.92)",
            borderBottom: "1px solid var(--bd)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[56px]">
              <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30,
                  background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                  borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 0 18px rgba(99,102,241,0.3)",
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L12.5 4V10L7 13L1.5 10V4L7 1Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                    <circle cx="7" cy="7" r="1.8" fill="white"/>
                  </svg>
                </div>
                <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.015em" }}>
                  Agent Platform
                </span>
              </a>

              <div className="flex items-center gap-2">
                <a href="/crm" className="settings-link" style={{ display: "flex", alignItems: "center", gap: 5 }}>CRM</a>
                <a href="/settings" className="settings-link">Réglages</a>
                {user && (
                  <button
                    onClick={() => signOut(auth)}
                    className="settings-link"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    Déconnexion
                  </button>
                )}
                <span style={{
                  fontSize: 11, color: "var(--muted2)",
                  background: "var(--surface3)", border: "1px solid var(--bd-bright)",
                  borderRadius: 5, padding: "2px 7px", fontWeight: 500,
                }}>v1.0</span>
              </div>
            </div>
          </div>
        </header>

        <main style={{
          flex: 1,
          maxWidth: 1380,
          margin: "0 auto",
          width: "100%",
          padding: "0 24px",
          height: "calc(100vh - 56px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
