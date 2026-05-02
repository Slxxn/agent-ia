import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agent Platform",
  description: "Autonomous AI coding agent — multi-project management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
