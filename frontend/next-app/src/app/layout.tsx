import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Platform - Dashboard",
  description: "Plateforme de gestion d'agents IA multi-projets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-dark-950">
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-dark-900 border-b border-dark-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">⚙️</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Agent Platform</h1>
                    <p className="text-sm text-gray-400">Gestion d'agents IA multi-projets</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>v1.0.0</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-dark-900 border-t border-dark-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
              <p>© 2024 Agent Platform. Tous droits réservés.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
