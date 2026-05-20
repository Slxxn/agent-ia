import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
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
  title: "builderz — Votre site web pro, livré en 72h",
  description: "Site web professionnel créé par IA en 72h pour les TPE/PME",
  openGraph: {
    title: "builderz — Votre site web pro, livré en 72h",
    description: "Site web professionnel créé par IA en 72h pour les TPE/PME",
    url: "https://builderz.shop",
    siteName: "builderz",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "builderz" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "builderz — Votre site web pro, livré en 72h",
    description: "Site web professionnel créé par IA en 72h pour les TPE/PME",
    images: ["/og-image.svg"],
  },
  manifest: "/manifest.json",
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${syne.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
