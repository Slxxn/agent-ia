---
name: site-generator
description: Instructions pour générer un site builderz depuis un brief.md. Charger dès qu'un fichier brief.md est présent dans le workspace.
---

# Skill — Site Generator builderz.shop

## Quand ce skill s'applique
Dès que tu vois un fichier `brief.md` dans un dossier `workspace/`,
ce skill définit exactement comment générer le site.

## Ordre de travail obligatoire

### 1. Lire le brief en entier
```bash
cat workspace/{slug}/brief.md
```
Ne pas écrire une seule ligne avant d'avoir tout lu.

### 2. Identifier ce qu'il faut générer
- Quel hero block ?
- Quelles sections dans quel ordre ?
- Quelles pages ?
- Quelles fonctionnalités ?

### 3. Compléter App.tsx en premier
Remplacer les commentaires :
- `// PAGES_IMPORTS` → vrais imports
- `// ROUTES` → vraies routes React Router
- `// BUSINESS_NAME` dans Navbar → vrai nom

### 4. Générer le Hero
Créer `src/components/hero/{HeroBlock}.tsx`
Props : businessName, tagline, description, ctaPrimary, stats, image
CSS variables uniquement — jamais de couleurs hardcodées.

### 5. Générer les sections dans l'ordre du brief
Pour chaque section :
- Créer `src/components/sections/{SectionName}.tsx`
- Contenu réel basé sur le brief
- Animations Framer Motion avec variants
- CSS variables pour toutes les couleurs

### 6. Générer les pages
Pour chaque page listée :
- Créer `src/pages/{PageName}.tsx`
- Importer et composer les sections
- Pas de logique métier dans les pages

### 7. Personnaliser Navbar et Footer
- Navbar : vrais liens + CTA adapté à l'objectif
- Footer : nom entreprise + liens légaux + contacts

---

## Règles CSS — TOUJOURS respecter

```tsx
// ✅ Correct
className="bg-[var(--bg-primary)] text-[var(--text-primary)]"
className="border border-[var(--border-default)]"
className="text-[var(--color-accent)]"

// ❌ Jamais
className="bg-[#050505] text-white"
className="text-indigo-400"
style={{ color: '#6366f1' }}
```

---

## Règles animations — TOUJOURS respecter

```tsx
const variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

<motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  <motion.h2 variants={variants}>Titre</motion.h2>
  <motion.p variants={variants}>Texte</motion.p>
</motion.div>
```

---

## Checklist avant de finir

- [ ] Chaque route dans App.tsx a un fichier page correspondant
- [ ] Aucun `href="#"` sans scroll target id
- [ ] Footer a un lien `/mentions-legales`
- [ ] Formulaires : validation + loading + succès + erreur réseau
- [ ] Pas de Lorem ipsum
- [ ] Pas de couleurs hardcodées

---

## Après génération — toujours lancer

```bash
# TypeScript check
cd workspace/{slug} && npx tsc --noEmit

# Build test
npm run build

# Enregistrer dans le dashboard
cd ../..
python backend/tools/register_project.py \
  --name "{businessName}" \
  --slug "{slug}" \
  --sector "{sector}" \
  --type "{siteType}" \
  --is-client false
```
