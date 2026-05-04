import {
  ClientRequest,
  SITE_GOALS,
  SITE_TYPES,
  SECTORS,
  COLOR_THEMES,
  COLOR_THEMES_3D,
  VISUAL_STYLES,
  VISUAL_STYLES_3D,
} from '@/types/clientRequest';

export function generatePromptFromRequest(req: ClientRequest): string {
  const is3d = req.siteType === '3d';
  const siteTypeMeta = SITE_TYPES.find(t => t.key === req.siteType);
  const sector = SECTORS.find(s => s.key === req.sector);
  const goal = SITE_GOALS.find(g => g.key === req.siteGoal);
  const theme = (is3d ? COLOR_THEMES_3D : COLOR_THEMES).find(t => t.key === req.colorTheme);
  const style = (is3d ? VISUAL_STYLES_3D : VISUAL_STYLES).find(s => s.key === req.visualStyle);

  return `
🎯 PROJECT: ${req.businessName}
Site Type: ${siteTypeMeta ? siteTypeMeta.label : req.siteType}${is3d ? ' [3D/IMMERSIVE — use Three.js / React Three Fiber]' : ''}
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
- Colors: ${(req.colors?.length ? req.colors : [req.primaryColor]).join(', ')}
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
${is3d ? `
## 3D / Immersive Mode Rules (MANDATORY)
1. This is a 3D immersive experience — use Three.js / @react-three/fiber + @react-three/drei.
2. Add three, @react-three/fiber, @react-three/drei, @react-spring/three to package.json.
3. Hero section MUST contain a <Canvas> scene from @react-three/fiber. Keep it performant.
4. Use Lenis or framer-motion scroll for smooth scroll storytelling.
5. Provide a non-WebGL fallback for mobile (<Canvas> wrapped in Suspense with a CSS fallback).
6. All background colors must be very dark (near-black) — this is a dark immersive experience.
7. CSS --bg: #05050f or client-chosen dark tone; all text must have high contrast on dark bg.
8. Particle systems: use @react-three/drei Points or simple instanced meshes — NOT canvas 2D.
9. Custom cursor: implement via a React portal div tracking mousemove, not a DOM cursor override.
10. GSAP (if used): register ScrollTrigger plugin. Prefer framer-motion for simple animations.
` : ''}
  `.trim();
}
