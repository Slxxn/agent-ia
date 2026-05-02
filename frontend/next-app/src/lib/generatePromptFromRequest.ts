import { ClientRequest, SITE_GOALS, SECTORS, COLOR_THEMES, VISUAL_STYLES } from '@/types/clientRequest';

export function generatePromptFromRequest(req: ClientRequest): string {
  const sector = SECTORS.find(s => s.key === req.sector);
  const goal = SITE_GOALS.find(g => g.key === req.siteGoal);
  const theme = COLOR_THEMES.find(t => t.key === req.colorTheme);
  const style = VISUAL_STYLES.find(s => s.key === req.visualStyle);

  return `
🎯 PROJECT: ${req.businessName}
Sector: ${sector ? `${sector.emoji} ${sector.label}` : req.sector}
Primary Goal: ${goal ? `${goal.label} — ${goal.desc}` : req.siteGoal}

## Brand Identity
- Business name: ${req.businessName}
${req.tagline ? `- Tagline / slogan: "${req.tagline}"` : ''}
${req.description ? `- Description: ${req.description}` : ''}

## Logo
${req.logoUrl
  ? `- Logo image URL: ${req.logoUrl}
  IMPORTANT: Use this logo image in the Navbar and anywhere a logo appears.
  In Navbar: <img src="${req.logoUrl}" alt="${req.businessName}" className="h-8 w-auto object-contain" />
  Do NOT use text or icons as the logo — use the provided image URL.`
  : `- No logo provided — use styled text (business name) as the logo in the Navbar.`
}

## Visual Direction
- Style: ${style ? `${style.label} — ${style.desc}` : req.visualStyle}
- Color theme: ${theme ? `${theme.label} (${theme.desc}, base: ${theme.preview})` : req.colorTheme}
- Primary accent color: ${req.primaryColor}
${req.inspirationSites ? `- Inspiration sites: ${req.inspirationSites}` : ''}

## Target Audience
${req.targetAudience || 'General public'}

## Unique Value Proposition
${req.uniqueValue || 'Not specified'}

${req.competitors ? `## Competitors / Benchmarks\n${req.competitors}\n` : ''}

## Pages Required
${req.pages.map(p => `- ${p}`).join('\n')}

## Features Required
${req.features.length > 0 ? req.features.map(f => `- ${f}`).join('\n') : '- Basic contact form'}

## Budget Range
${req.budget || 'Not specified'}

${req.notes ? `## Additional Notes\n${req.notes}\n` : ''}

## Homepage Structure Rules (MANDATORY)
- Max 6–7 sections on the homepage — no more.
- Section order: Hero → Social proof / logos → Core value proposition → Key features (3) → CTA section → Footer
- Hero MUST have: headline using the tagline, sub-headline, primary CTA button, optional hero image/visual.
- Do NOT put the full FAQ, full service list, or full gallery on the homepage — use teaser cards + "See more" links.
- Every section must have a clear visual hierarchy and breathing room (py-12 lg:py-16 padding).

## Absolute Technical Rules
1. Every generated file MUST contain its COMPLETE implementation. No placeholders.
2. cartStore.ts MUST export both useCart AND useCartStore (alias).
3. Never write JSX in .ts files — use createElement() instead.
4. Every import in App.tsx must point to a file explicitly generated.
5. src/lib/utils.ts must export cn() and formatPrice().
6. Mobile-first responsive design on every component.
7. If a logo URL is provided above, it MUST appear in the Navbar as an <img> tag.
8. FRAMER MOTION: staggerContainer uses animate="show"/whileInView="show"; fadeInUp/scaleIn use animate="visible"/whileInView="visible". Never mix keys.
9. All custom CSS classes used in JSX (gradient-text, section-label, shadow-glow, etc.) MUST be defined in globals.css.
10. Section padding: py-12 lg:py-16 maximum. Never use py-24, py-28, py-32 or higher.
11. Layout already adds pt-16 lg:pt-20 on <main> for the fixed navbar. Do NOT add extra pt-* to the HeroSection wrapper.
12. External images: only use Unsplash URLs (https://images.unsplash.com/...). Never fabricate image URLs.
  `.trim();
}
