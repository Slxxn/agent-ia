---
name: gsap-scrolltrigger
description: GSAP ScrollTrigger rules for scroll-driven animations in React — correct patterns, cleanup, useGSAP hook.
type: reference
---

# GSAP ScrollTrigger — React Rules

## Setup (mandatory)
```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger, useGSAP);
```
- `gsap.registerPlugin()` at module level, OUTSIDE the component.
- Always `useGSAP()` instead of `useEffect` for GSAP animations — handles cleanup automatically.

## Basic scroll-triggered animation
```tsx
useGSAP(() => {
  gsap.from('.hero-title', {
    opacity: 0, y: 80, duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.hero-title',
      start: 'top 85%',
      end: 'top 40%',
      scrub: false,
    },
  });
}, []);
```

## Pinned section with scrub timeline
```tsx
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=600',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });
  tl.from('.chapter-text', { opacity: 0, y: 60 })
    .from('.chapter-image', { opacity: 0, scale: 0.9 }, '-=0.4');
}, { scope: sectionRef });
```

## Staggered reveal
```tsx
gsap.from('.card', {
  opacity: 0, y: 40, stagger: 0.12, duration: 0.8,
  ease: 'power2.out',
  scrollTrigger: { trigger: '.cards-grid', start: 'top 80%' },
});
```

## Cleanup (automatic with useGSAP)
`useGSAP` auto-kills all ScrollTriggers created inside its scope on unmount. Never manually call `ScrollTrigger.getAll().forEach(t => t.kill())` inside `useGSAP` — it creates double-cleanup.

## Anti-patterns
- NEVER `window.addEventListener('scroll', ...)` — causes continuous reflows.
- NEVER animate `top`, `left`, `width`, `height` — only `transform` (x/y/scale/rotation) and `opacity`.
- NEVER use `useEffect` for GSAP in React — use `useGSAP`.
- NEVER forget `scrub: 1` on pinned sections — without it pins feel broken.

## Required packages
```json
{ "gsap": "^3.12.5", "@gsap/react": "^2.1.2" }
```
