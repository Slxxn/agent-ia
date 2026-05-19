# Skill — Protocole de livraison builderz.shop

> Ce skill est lu automatiquement par Claude Code à chaque fois
> qu'il génère ou modifie un site pour builderz.shop.
> Il définit le protocole complet de création → enregistrement → déploiement.

---

## Quand appliquer ce skill

Dès que tu crées un nouveau site React/Vite pour un client ou pour un test,
tu suis ce protocole dans l'ordre. Sans exception.

---

## Étape 1 — Générer le site

Génère le site dans `workspace/{slug-du-projet}/` à la racine de agent-platform.

Convention de nommage du dossier :
- Client réel : `workspace/salon-emma-montpellier/`
- Test : `workspace/test-coiffeur-dark/`
- Toujours en minuscules, tirets, pas d'espaces

Structure obligatoire générée :
```
workspace/{slug}/
├── src/
│   ├── main.tsx          → BrowserRouter ici uniquement
│   ├── App.tsx           → Routes complètes
│   ├── index.css         → Import tokens.css
│   ├── styles/
│   │   └── tokens.css    → Variables CSS du design system
│   ├── pages/            → Une page par route
│   └── components/       → Composants réutilisables
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

---

## Étape 2 — Vérifier la complétude avant tout

Avant de continuer, vérifie ces points :

```bash
# Vérifier qu'il n'y a pas de liens morts
grep -r "to=\"/" workspace/{slug}/src --include="*.tsx" | grep -v "App.tsx"
# Chaque route trouvée doit avoir un fichier dans src/pages/

# Vérifier qu'il n'y a pas de href="#" sans target
grep -r 'href="#"' workspace/{slug}/src --include="*.tsx"
# Ne doit rien retourner

# Vérifier les imports manquants
cd workspace/{slug} && npx tsc --noEmit 2>&1 | head -20
```

Si des erreurs sont trouvées, les corriger avant de passer à l'étape 3.

---

## Étape 3 — Enregistrer le projet dans le dashboard

Lance ce script pour que le site apparaisse dans /app/platform :

```bash
python backend/tools/register_project.py \
  --name "Nom du projet" \
  --slug "slug-du-projet" \
  --sector "beaute|restaurant|artisan|coach|photo|medical|immobilier|sport|tech|mode|association|autre" \
  --type "standard|scrollytelling|3d" \
  --is-client false \
  --client-email "" \
  --notes "Description courte du projet"
```

**Règle importante :**
- `--is-client false` → projet de test (visible dans Web Platform uniquement)
- `--is-client true` → client payant (visible dans Web Platform + ajouté à Site Guardian automatiquement)

---

## Étape 4 — Build et vérification locale

```bash
cd workspace/{slug}
npm install
npm run build
```

Si le build échoue :
1. Lire les erreurs TypeScript
2. Corriger une par une
3. Relancer jusqu'à build propre
4. Ne jamais déployer un site qui ne build pas

---

## Étape 5 — Déploiement Firebase (si client réel)

Pour un projet test : skip cette étape.

Pour un client réel (`--is-client true`) :

```bash
cd workspace/{slug}
firebase deploy --only hosting --project agent-ia-2d81a
```

Après déploiement :
- Copier l'URL Firebase générée
- Mettre à jour le projet dans le dashboard :

```bash
python backend/tools/register_project.py \
  --slug "slug-du-projet" \
  --update \
  --deploy-url "https://agent-ia-2d81a-xxx.web.app" \
  --status "deployed"
```

---

## Étape 6 — Basculer en client si projet de test validé

Quand un projet test est approuvé et devient un vrai livrable client :

```bash
python backend/tools/register_project.py \
  --slug "slug-du-projet" \
  --update \
  --is-client true \
  --client-email "client@email.com" \
  --client-name "Nom du client"
```

Cela déclenche automatiquement :
- Ajout dans Site Guardian pour surveillance
- Activation des checks uptime/SSL
- Envoi d'un email de bienvenue au client

---

## Règles de qualité obligatoires à chaque site

Ces règles s'appliquent TOUJOURS, peu importe le secteur ou le type :

### CSS
- Toujours utiliser `var(--color-accent)` jamais `#6366f1` hardcodé
- Toujours utiliser `var(--bg-primary)` jamais `bg-[#050505]`
- Toujours importer `tokens.css` dans `index.css`

### React/TypeScript
- BrowserRouter dans `main.tsx` uniquement
- Jamais de `any` dans les types
- Exports nommés pour les composants
- Chaque page dans `src/pages/`

### Animations
- Framer Motion avec variants (hidden/visible)
- whileInView + viewport once:true
- Maximum 3 types d'animation par site
- Cleanup GSAP dans useEffect si scrollytelling

### Formulaires
- Validation de tous les champs required
- État loading pendant envoi
- Message de succès après envoi
- Gestion erreur réseau

### Légal (obligatoire sur tous les sites)
- Page MentionsLegales liée dans le footer
- Pour les boutiques : CGV + PolitiqueConfidentialite
- CookiesBanner sur tous les sites

---

## Nomenclature des commits Git

Après chaque site généré ou modifié :

```bash
git add workspace/{slug}/
git commit -m "feat({slug}): génération initiale — {secteur} {type}"

# Exemples :
# feat(salon-emma): génération initiale — beaute standard
# fix(techup-antilles): correction liens morts catalogue
# update(mas-occitan): ajout section réservation
```

---

## Résumé du protocole en une ligne

```
Générer → Vérifier complétude → Enregistrer (test ou client) → Build → Déployer si client → Commit
```

---

*Skill builderz.shop — Protocol v1*
