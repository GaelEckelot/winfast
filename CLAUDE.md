# CLAUDE.md — UPPER LIFE (Augmented OS)

Note de contexte pour reprendre le projet rapidement dans une nouvelle session.
Réponds **en français** (l'utilisateur est francophone et débutant en dev).

## Le produit
**UPPER LIFE** — un dashboard de vie personnel, minimaliste et futuriste, « augmenté par l'IA ».
Navigation par **onglets en bandeau haut** (logo à gauche → Accueil). Modules :
**Accueil · Santé · Finances · Business · Travail · Vision · Knowledge · Agents**.

- **Accueil** : titre « Bonjour/Bonsoir, <prénom> » + **To-do « Todo du jour »** (centrée) :
  colonnes Tâche / Priorité (menu Top 1/2/3), ajout via `+`, suppression via `⋯`.
- Chaque **module** = en-tête (logo + titre + **KPIs à droite, sur 1 ligne**) puis un corps :
  - **Finances** = unique : **bilan financier** 6 colonnes (`FinanceLedger`).
  - **Knowledge** = unique : **domaines de connaissance** (`KnowledgeView`), pages de notes
    libres, réordonnables en **drag & drop**.
  - **Autres** = **projets en cours** (`ProjectCard`) avec tâches.

## Stack
Next.js 14 (App Router) · React 18 · TypeScript · Tailwind. Pas de backend BDD.
**Persistance = localStorage** (données par navigateur). Build : `npm run build`. Dev : `npm run dev`.

## Carte des fichiers
- `app/page.tsx` — shell : bandeau de nav (centré, sans %, sans scrollbar), thème toggle,
  rendu Accueil/Dashboard + panneau Copilote (repliable, fermé par défaut), modal prénom 1ʳᵉ visite.
- `app/layout.tsx` — fonts + script anti-flash thème.
- `app/globals.css` — variables de thème (clair/sombre), `.glass`, `.ledger-grid`, `.no-scrollbar`.
- `app/api/chat/route.ts` — endpoint Copilote (Anthropic, streaming). `GET` = état activé.
- `components/` : `Dashboard`, `KpiCard`, `ProjectCard`, `FinanceLedger`, `KnowledgeView`,
  `Home`, `DailyTodo`, `Assistant`, `ThemeToggle`, `Logo`, `Icon`.
- `lib/` : `types.ts`, `domains.ts` (méta des modules + `HOME_DOMAIN`), `seed.ts` (données par
  défaut), `store.ts` (hook `useStore` + `normalize` migration + helpers).

## Données & persistance (`lib/store.ts`)
- `useStore()` expose `data`, `todos`, `name`, mutateurs, `reset`.
- `DomainState = { kpis, projects, ledger?, knowledge? }`.
- `normalize(data)` à chaque chargement : garde les données connues, retire les modules obsolètes,
  seed les nouveaux, **synthétise un historique** pour les KPIs sans historique, et **réapplique
  les flags `derived` du seed par id** (important : sinon les KPIs auto restent figés pour les
  données existantes).
- Clés localStorage : `nexus-life-os:v1` (data), `nexus-life-os:todos:v1`, `upper-life:name:v1`,
  `upper-life:theme`.

## Détails métier importants
- **KPIs vivants** : chaque KPI a un `history` (mesures datées) + **sparkline**. Bouton `⊕` =
  saisir une mesure → recalcule valeur/variation/tendance.
- **KPI dérivé** (`Kpi.derived = "avg_progress"`) : lecture seule (badge AUTO), valeur calculée
  dans `Dashboard.effectiveKpi`. Utilisé par **Vision « Progression année »** = moyenne des
  `progress` des projets (temps réel).
- **Carte KPI « Tâches »** (live, lecture seule) : affichée pour les modules à projets
  (≠ Finances, ≠ Knowledge). Grille KPI = 5 colonnes si projets, sinon 4.
- **ProjectCard** : tâches cochables + **ajout inline** + suppression par tâche → la **progression
  se recalcule auto** (done/total). **Échéance éditable** (input date).
- **FinanceLedger** : 6 colonnes (Dépenses /an, Cashflow & liquidité, Asset & Investment, Dettes,
  Reste à payer, BILAN). Lignes libellé+montant, total auto ; BILAN = notes multi-lignes.
  Synthèse : **Patrimoine net** (vert si ≥0, rouge si <0) + Coût de vie/mois. Colonnes à largeurs
  variables via `.ledger-grid` (`minmax(0,fr)`). Séparateurs fins entre lignes (sauf BILAN).
- **KnowledgeView** : grille de domaines (titre éditable, ajout/suppression), clic = page de note
  libre (textarea), **réordonnable par drag & drop** (HTML5).

## Design system
- **Palette « pierres précieuses »** (deep, pas néon), un accent par module dans `lib/domains.ts` :
  Santé rubis `#c21f3a` · Finances émeraude `#0f8b58` · Business saphir `#1f63c9` ·
  Travail citrine `#c9921f` · Vision améthyste `#8b46b0` · Knowledge aigue-marine `#149aa0` ·
  Agents tanzanite `#4a4ad1`. Logo = triangle **or** sur tuile noire.
- **Thème clair/sombre** via variables CSS (`--surface/--panel/--ink/--muted/--line`) ; classe
  `.light` sur `<html>`. En composants : `text-ink`, `text-muted`, `bg-line/x`, `border-line/x`,
  `bg-surface/panel/elevated` (pas de `text-white`/`bg-white/x` en dur).
- Cartes = `.glass` + `.glass-hover`. Chiffres en `font-mono`.

## Copilote IA
Gratuit par défaut : sans `ANTHROPIC_API_KEY`, le panneau affiche « bientôt disponible » (pas
d'erreur). Avec une clé Anthropic (modèle `claude-opus-4-8`), il devient un chat contextualisé.
`resolveApiKey()` ignore les valeurs placeholder. Le copilote peut être global (Accueil) ou par module.

## Conventions de travail
- Brancher sur `claude/blissful-newton-2zob4w` (PR #1 vers `main`). Committer en **français**,
  messages descriptifs. Pousser après chaque évolution validée.
- UI/texte **en français**.
- L'utilisateur veut souvent une **capture** pour valider — mais c'est coûteux en tokens ;
  proposer le « mode économe » si besoin.

## Pièges connus
- Serveur **dev qui casse** après beaucoup de HMR (`Cannot find module './948.js'`) : tuer le
  process next, `rm -rf .next`, relancer `npm run dev`. Le build de prod, lui, reste clean.
- Largeurs de grille via `fr` simple = `minmax(auto, fr)` → les `<input>` imposent ~300px de min ;
  utiliser `minmax(0, fr)` + `min-w-0`.
- Outil de capture interne : `playwright-core` + Chromium dans `/opt/pw-browsers/...` (déjà présent).
