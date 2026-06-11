import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://builderz.shop"),
  title: "builderz — Votre site web pro, livré sous 5 jours",
  description: "Site web professionnel sur mesure, livré sous 5 jours, à partir de 290€. Pour les TPE et PME.",
  openGraph: {
    title: "builderz — Votre site web pro, livré sous 5 jours",
    description: "Site web professionnel sur mesure, livré sous 5 jours, à partir de 290€. Pour les TPE et PME.",
    url: "https://builderz.shop",
    siteName: "builderz",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "builderz — sites web pro pour TPE et PME" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "builderz — Votre site web pro, livré sous 5 jours",
    description: "Site web professionnel sur mesure, livré sous 5 jours, à partir de 290€. Pour les TPE et PME.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${syne.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <ClientLayout>{children}</ClientLayout>
        {/* Plausible Analytics — remplace builderz.shop par ton domaine Plausible */}
        <Script
          defer
          data-domain="builderz.shop"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
