"use client";

import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthProvider, useAuth } from "@/lib/authContext";
import AuthGuard from "@/lib/AuthGuard";

const PUBLIC_ROUTES = ["/form", "/login", "/p", "/mon-espace", "/success"];
const PUBLIC_EXACT = ["/"];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isPublic = PUBLIC_EXACT.includes(pathname) || PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  const isAppRoute = pathname.startsWith('/app');
  const isSettingsRoute = pathname === '/settings';

  if (isPublic) return <>{children}</>;

  // /app/* et /settings : auth guard sans header (pas de navbar)
  if (isAppRoute || isSettingsRoute) return <AuthGuard>{children}</AuthGuard>;

  return (
    <AuthGuard>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
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
              <a href="/app/platform" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
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
                <span style={{ color: "var(--text)", fontWeight: 800, fontSize: 15, letterSpacing: "-0.04em" }}>
                  builderz
                </span>
              </a>

              <div className="flex items-center gap-2">
                <a href="/app/crm" className="settings-link" style={{ display: "flex", alignItems: "center", gap: 5 }}>CRM</a>
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
          padding: "24px 24px 48px",
          overflowY: "auto",
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
