---
name: site-generator
description: Instructions pour générer un site builderz de qualité agence depuis un brief.md. Charger dès qu'un fichier brief.md est présent dans le workspace. Pour les sites clients TPE, ce skill PRIME sur taste.md (qui reste valable pour les dashboards/SaaS).
---

# Skill — Site Generator builderz.shop

## Objectif de qualité

Chaque site généré doit être indistinguable d'un site fait par une agence à 3000€.
Référence de niveau : https://sandrinemass-gpwkxpty.manus.space (généré par Manus).
Ce qui fait ce niveau : direction artistique sectorielle, 3 fontes, vraies photos,
séparateurs organiques, contenu dense et localisé, micro-détails. Tout est codifié ci-dessous.

## Quand ce skill s'applique

Dès que tu vois un fichier `brief.md` dans un dossier `workspace/`.
Pour les sites clients TPE (vitrine, resto, beauté…), ce skill **override taste.md** :
les serifs, scripts et palettes chaudes sont non seulement autorisés mais souvent obligatoires.
taste.md reste la référence pour les dashboards, SaaS et UIs techniques.

---

## Ordre de travail obligatoire

### 0. Lire le brief en entier — puis poser la direction artistique
Avant d'écrire du code, écris en 5 lignes (dans ta réponse, pas dans un fichier) :
- Palette retenue (6 tons avec hex) — partir de la recette secteur ci-dessous, ajuster avec les couleurs client
- Trio de fontes (display / body / accent script éventuel)
- Type de séparateurs de sections (vagues, arches, diagonales, aucun)
- 2 signatures visuelles du site (ex : "photos dans des arches", "stats bar serif géante")
- Ton du copywriting (ex : "chaleureux et sensoriel", "précis et rassurant")

### 1. Identifier la structure
- Hero block, sections dans l'ordre, pages, fonctionnalités (depuis le brief)

### 2. Télécharger les images AVANT de coder
Voir section "Stratégie images" — les images doivent exister dans `public/images/`
avant que les composants y fassent référence.

### 3. Compléter App.tsx, puis Hero, puis sections, puis pages, puis Navbar/Footer
- `// PAGES_IMPORTS` → vrais imports ; `// ROUTES` → vraies routes ; `// BUSINESS_NAME` → vrai nom
- Hero : `src/components/hero/{HeroBlock}.tsx`
- Sections : `src/components/sections/{SectionName}.tsx`
- Pages : `src/pages/{PageName}.tsx` (composition de sections, pas de logique)

### 4. Vérification visuelle obligatoire (voir section dédiée) — JAMAIS livrer sans avoir VU le site

---

## Recettes par secteur — Direction artistique

Point de départ obligatoire. Les couleurs client (si fournies) remplacent l'accent,
mais la **logique de palette** (fond teinté, tints, 2 accents) reste.
Jamais de blanc pur `#ffffff` ni de noir pur `#000000` en fond — toujours teinté secteur.

### beaute / bien-être (thème clair par défaut)
- Palette : fond crème `#faf6f1`, surface `#f3ece4`, accent terracotta `#b5755f`, accent-2 vert d'eau `#a8c5bc`, tint rose poudré `#f0dfd8`, texte `#3d3431`
- Fontes : Cormorant Garamond (display) + Raleway (body) + Great Vibes (accent script)
- Signatures : photos dans des arches (`border-radius: 50% 50% 0 0` ou `9999px 9999px 0 0`), séparateurs en vagues, mots en italique script dans les titres
- Sombre si demandé : fond `#1c1714`, surface `#28201c`, mêmes accents éclaircis

### restaurant / café
- Palette clair : fond `#faf7f2`, surface `#f1ebe1`, accent bordeaux `#8c3b2e` ou safran `#c8842c`, accent-2 olive `#7a7d5c`, texte `#2e2a26`
- Sombre : fond `#171311`, surface `#231d19`, accent doré `#caa05a`
- Fontes : Playfair Display + Lato, ou Fraunces + Work Sans. Accent script possible : Pinyon Script
- Signatures : menu typographié avec lignes pointillées prix, photos plats plein cadre, ornements (étoiles, brins)

### artisan / BTP
- Palette : fond `#f7f5f1`, surface `#edeae3`, accent ocre `#b07d3f` ou bleu ardoise `#3e5c6b`, accent-2 `#5c5246`, texte `#2b2823`
- Fontes : Archivo ou Oswald (display) + Source Sans 3 (body) — pas de script
- Signatures : grandes photos chantier/atelier, chiffres en gros (années, chantiers), process numéroté 01/02/03

### coach / formation
- Palette : fond `#f8f7f4`, surface `#eeede8`, accent `#4a6b5d` (vert profond) ou `#7c5cbf` désaturé, texte `#26241f`
- Fontes : Fraunces ou Lora (display) + Inter tight (body)
- Signatures : portrait pleine hauteur, citation manuscrite, timeline méthode

### photo / créatif
- Palette sombre par défaut : fond `#101010`, surface `#1a1a1a`, accent au choix désaturé, texte `#ececec`
- Fontes : Syne ou Space Grotesk + Inter
- Signatures : galerie masonry, hover zoom doux, typographie XXL

### medical / paramédical
- Palette : fond `#f6f9f9`, surface `#eaf1f1`, accent `#2e6e6a` (teal profond), accent-2 `#9fc4c0`, texte `#23312f`
- Fontes : Lora (display) + Source Sans 3 (body) — sobre, rassurant
- Signatures : badges certifications, process de prise en charge, FAQ accordéon

### immobilier
- Palette : fond `#f8f7f5`, surface `#edebe6`, accent `#1f3a5f` (bleu nuit) + doré discret `#b59b6a`, texte `#23262b`
- Fontes : Cormorant Garamond + Jost
- Signatures : cards biens avec prix serif géant, carte/quartiers, stats marché

### sport / fitness
- Palette sombre : fond `#0e0f12`, surface `#191b20`, accent énergique `#d4502e` ou `#9ee04a` désaturé, texte `#f2f2f2`
- Fontes : Archivo Black ou Anton + Inter
- Signatures : typographie inclinée/condensée, chiffres performance, planning grid

### mode / boutique
- Palette : fond `#f9f7f4`, accent noir doux `#1c1a18` + 1 couleur saison, texte `#211f1d`
- Fontes : Marcellus ou Italiana + Jost
- Signatures : photos éditoriales grandes, lookbook, typographie espacée luxe

### tech / digital
- Suivre taste.md (c'est le territoire SaaS) — Geist/Satoshi, palette froide, bento

### association
- Palette : fond `#fbf9f5`, accent chaleureux `#c0572e` ou `#33658a`, texte `#2c2a26`
- Fontes : Bitter + Source Sans 3
- Signatures : photos humaines, chiffres d'impact, section "agir" avec 3 moyens

### autre
- Choisir la recette la plus proche du métier décrit, sinon : fond `#f8f7f4`, accent désaturé issu des couleurs client, Fraunces + Inter

---

## Variation structurelle — ANTI-RESSEMBLANCE

La palette ne suffit pas : si deux sites générés partagent le même squelette,
c'est un échec. Le squelette "maison" (badge pill → H1 avec un mot coloré →
2 CTA → stats en ligne ; micro-label uppercase au-dessus de chaque titre ;
FAQ accordéon à cercles + ; CTA final centré) est celui de builderz.shop —
**interdit de le répliquer sur un site client**.

À chaque site, choisir consciemment UN archétype par bloc (et varier d'un site à l'autre) :

**Hero (4 archétypes)**
1. *Split* : texte gauche / image droite avec badge flottant — SaaS, services pro
2. *Full-bleed* : photo pleine largeur + overlay + texte posé dessus — commerces, restos, artisans
3. *Éditorial centré* : typographie XXL, pas d'image, ornement discret — luxe, mode, créatifs
4. *Produit d'abord* : image/objet dominant, texte secondaire — boutiques, portfolio

**Labels de section (varier le système, un seul par site)**
- Overline uppercase letterspaced (le plus courant — ne pas en abuser)
- Numéroté : `01 — Services` en font display
- Barre latérale accent + titre sans label
- Mot en fonte accent script italique (secteurs chaleureux)

**FAQ** : accordéon souligné (chevron), liste 2 colonnes statique, ou cartes — jamais deux fois le même que le site précédent
**CTA final** : split contact (texte + carte infos/horaires), bandeau photo pleine largeur, ou carte centrée — pas toujours centré
**Stats** : bande bordée pleine largeur, colonne latérale, ou intégrées au hero — varier

---

## Règle des 3 fontes

1. **Display** (titres) — serif ou grotesque de caractère selon secteur
2. **Body** (texte) — sans-serif lisible, line-height 1.7
3. **Accent script** (optionnel, secteurs chaleureux) — Great Vibes, Pinyon Script, Dancing Script…
   utilisée UNIQUEMENT pour : 1-2 mots dans un titre, le micro-label d'ouverture de section, la signature

Pattern signature des titres (fortement recommandé secteurs chaleureux) :
```tsx
<h2 className="font-[var(--font-display)] ...">
  Une praticienne <em className="font-[var(--font-accent)] text-[var(--color-accent)] not-italic">passionnée</em>
</h2>
```

Import : toutes les fontes via Google Fonts dans tokens.css (déjà géré par brief_to_claude.py).

---

## Stratégie images — OBLIGATOIRE

Un site TPE sans vraies photos = échec. Jamais de picsum (photos hors-sujet), jamais de divs grises.

### Procédure
1. Choisis 6-10 mots-clés métier EN ANGLAIS (ex : "massage spa candles", "hair salon interior")
2. Télécharge depuis Unsplash Source (stable, sans clé API) dans `public/images/` :
```bash
cd workspace/{slug}
mkdir -p public/images
curl -L -o public/images/hero.jpg "https://images.unsplash.com/photo-{ID}?w=1600&q=80"
# OU recherche sans ID précis :
curl -L -o public/images/hero.jpg "https://source.unsplash.com/1600x900/?massage,spa"
```
3. **Vérifie chaque image** : `file public/images/*.jpg` (doit dire JPEG, > 30 Ko) ;
   si une URL échoue, retente avec un autre mot-clé. Une image cassée = build refusé.
4. Référence en `/images/hero.jpg` dans les composants (jamais d'URL externe en prod).

### Traitement visuel des photos (au moins 2 différents par site)
- Hero : photo plein cadre + overlay gradient vers le fond (`bg-gradient-to-t from-[var(--bg-primary)]`)
- Forme arche : `rounded-t-full overflow-hidden aspect-[3/4]`
- Forme organique : `border-radius: 60% 40% 55% 45% / 50% 55% 45% 50%`
- Cards : `aspect-[4/3] object-cover` + zoom doux au hover (`group-hover:scale-105 transition`)

---

## Composants signature — en inclure AU MOINS 5 par site

C'est ce qui sépare un site "correct" d'un site "wahou" :

1. **Micro-label d'ouverture** au-dessus de chaque titre de section :
   `<span className="text-xs tracking-[0.25em] uppercase text-[var(--color-accent)]">Mon histoire</span>`
2. **Stats bar** : 3-4 chiffres en font display géante (années, clients, avis…) — chiffres RÉALISTES du brief, jamais inventés au-delà du plausible
3. **Citation** avec barre latérale accent ou guillemet géant serif
4. **Badge flottant** sur une photo (ex : pastille ronde "10+ années d'expérience")
5. **Séparateur organique** entre 2 sections de fonds différents :
```tsx
<div aria-hidden className="-mb-px">
  <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" className="w-full h-12 md:h-16 block">
    <path d="M0 32 C240 64 480 0 720 24 C960 48 1200 8 1440 32 L1440 64 L0 64 Z" fill="var(--bg-secondary)" />
  </svg>
</div>
```
6. **Pricing avec tier vedette** : carte centrale en fond accent foncé + badge "Recommandé", économies affichées
7. **Témoignages** : étoiles, avatar initiales sur pastille couleur, prénom + initiale + ville — JAMAIS "Jean Dupont"
8. **CTA secondaire** mi-page (carte cadeau, devis, première séance) sur fond accent avec formes décoratives
9. **Liste prix typographiée** (restaurants/salons) : intitulé + ligne pointillée + prix `…………… 45€`
10. **Texture de fond subtile** sur une section : motif dots (`radial-gradient(circle, var(--border-default) 1px, transparent 1px)` size 24px) ou grain

---

## Copywriting — règles dures

- **Localisation partout** : la ville du brief apparaît dans le hero, le footer, les témoignages, le title SEO. "Massage & bien-être à Montpellier" >> "Massage & bien-être"
- **Chiffres organiques** : 127 avis, 4,9/5, 850+ clients — jamais 100%, 50%, 99,99%
- **Prix réels** : utiliser les services/tarifs du brief tels quels ; s'il en manque, déduire des prix plausibles du marché local et les marquer clairement dans le récap final pour validation client
- **Interdits** : Lorem ipsum, "Élevez votre…", "Libérez le potentiel", "solutions sur mesure" (sans objet concret), emojis dans le contenu du site
- **Ton sectoriel** : sensoriel pour beauté/spa, gourmand pour resto, précis et chiffré pour artisan/BTP, rassurant pour médical
- Title SEO : `{Métier} à {Ville} — {Nom}` ; meta description avec ville + bénéfice + CTA

---

## Règles CSS — TOUJOURS respecter

```tsx
// ✅ Correct
className="bg-[var(--bg-primary)] text-[var(--text-primary)]"
className="text-[var(--color-accent)] border-[var(--border-default)]"

// ❌ Jamais
className="bg-[#050505] text-indigo-400"
style={{ color: '#6366f1' }}
```
Les variables disponibles sont dans `src/styles/tokens.css` (généré) — les lire avant de coder.
Si une teinte manque (ex : tint clair de l'accent), utiliser `color-mix(in srgb, var(--color-accent) 15%, transparent)`.

---

## Règles animations

```tsx
const variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
// whileInView + viewport={{ once: true, margin: "-80px" }} sur toutes les sections
```
- Max 3 types d'animation : apparition scroll, hover, transition de page
- Hover photos : `scale-105` 500ms ; hover cards : élévation ombre teintée
- `prefers-reduced-motion` respecté (Framer le gère si on n'anime que transform/opacity)

---

## Vérification visuelle — OBLIGATOIRE, à CHAQUE modification

Un site jamais regardé est un site non livré. Et une modification vérifiée
en desktop seul N'EST PAS vérifiée : **toujours les 3 breakpoints**, mobile d'abord.

```bash
cd workspace/{slug} && npm run build && npx vite preview --port 4699 &
sleep 3
node scripts/visual-check.mjs http://localhost:4699   # depuis la racine agent-ia
kill %1
```

Le script teste 390 / 768 / 1440, **échoue si débordement horizontal**, et
écrit toutes les captures dans `/tmp/visual-check/`. Ensuite **lire les
captures avec l'outil Read** (mobile-390 en premier) et vérifier :
- [ ] Toutes les images chargent, contraste suffisant (texte lisible sur photos)
- [ ] Aucun contenu qui déborde de sa carte/conteneur (le script ne voit que le viewport)
- [ ] Navbar intacte à 768 (logo sur une ligne, CTA non cassé)
- [ ] Hiérarchie typographique claire, espacements réguliers
- [ ] Le site ressemble à la direction artistique annoncée à l'étape 0
- [ ] Pas de section vide ou de placeholder visible

**Règles dures :**
- Cette vérification se relance après CHAQUE modification visuelle, même
  d'un seul composant — pas seulement à la génération initiale.
- Échec du script ou capture douteuse → corriger → re-vérifier. Jamais de
  déploiement entre-temps.

### Pièges responsive connus (à ne jamais reproduire)
- `whitespace-nowrap` UNIQUEMENT sur du contenu court et fixe (prix, chiffres,
  numéro de téléphone) — jamais sur un libellé de longueur variable
- `divide-x` sur une grille multi-rangées casse les bordures en mobile
  2 colonnes → calculer les bordures par index (`border-l` si i%2===1, etc.)
- Hero full-bleed : renforcer l'overlay et réduire la hauteur sur mobile
  (`min-h-[74dvh] md:min-h-[88dvh]`), l'image recadrée peut devenir criarde
- Navbar : les liens du menu passent en burger sous `lg` si logo + 4-5 liens
  + CTA téléphone (768 est trop étroit pour tout)

---

## Checklist finale avant de finir

- [ ] Chaque route dans App.tsx a un fichier page
- [ ] Aucun `href="#"` sans target
- [ ] Footer : ville + téléphone + liens légaux (`/mentions-legales`)
- [ ] Formulaires : validation + loading + succès + erreur
- [ ] Pas de Lorem ipsum, pas de couleurs hardcodées, pas d'emojis dans le site
- [ ] Title + meta description localisés dans index.html
- [ ] ≥ 5 composants signature présents
- [ ] Vérification visuelle faite et validée (screenshots lus)

## Après génération

```bash
cd workspace/{slug} && npx tsc --noEmit && npm run build
cd ../.. && python backend/tools/register_project.py \
  --name "{NOM}" --slug "{slug}" --sector "{secteur}" --type "{type}" --is-client false
```
