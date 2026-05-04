/**
 * siteConfig.ts — generated per project by the assembler.
 * Contains all content/colors/structure for this site.
 */
import type { NavbarConfig } from '@/blocks/layout/Navbar';
import type { FooterConfig } from '@/blocks/layout/Footer';

export interface SiteConfig {
  title: string;
  navbar: NavbarConfig;
  footer: FooterConfig;
  theme: {
    primary: string;
    primaryHover: string;
    accent: string;
    accent2: string;
    bg: string;
    surface: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  title: '{{SITE_TITLE}}',
  navbar: {
    logo: { text: '{{BRAND_NAME}}' },
    links: [],
    cta: undefined,
  },
  footer: {
    logo: { text: '{{BRAND_NAME}}', tagline: '{{BRAND_TAGLINE}}' },
    columns: [],
    socials: [],
  },
  theme: {
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    accent: '#818cf8',
    accent2: '#38bdf8',
    bg: '#0f0f12',
    surface: '#1a1a1f',
  },
};
