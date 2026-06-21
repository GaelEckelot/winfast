# WinFast — Augmented OS

Dashboard **minimaliste & futuriste** pour piloter sa vie, augmenté par l'IA.
*Réussir sa vie, plus vite.* Plusieurs modules de management, chacun avec ses KPIs,
ses projets en cours et un **copilote IA** (Claude) contextualisé.

## Modules

| Module | Contenu |
|---|---|
| **Accueil** | Salutation + To-do « Todo du jour » (priorités, drag & drop) |
| **Santé** | Sommeil, activité, récupération, stress |
| **Finances** | Bilan financier (dépenses, cashflow, assets, dettes…) |
| **Business** | KPIs + **S.O.P** (procédures par étapes) + projets |
| **Travail** | Focus, livrables, productivité |
| **Vision** | Objectifs annuels (progression auto) |
| **Knowledge** | Domaines de notes, second cerveau |
| **Agents** (AI) | Automatisations & agents autonomes |

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** — thème clair/sombre, glassmorphism, palette « pierres précieuses »
- **Supabase** — authentification (comptes) + base de données Postgres (données par compte)
- **Repli localStorage** : sans clés Supabase, l'app tourne en mode local mono-appareil
- **IA réelle** : route serveur `/api/chat` qui appelle l'API **Claude** (`claude-opus-4-8`) en
  streaming, réservée aux utilisateurs connectés. La clé API reste côté serveur.

## Démarrage

```bash
npm install

cp .env.local.example .env.local
# Renseigner ANTHROPIC_API_KEY (copilote IA) et/ou les clés Supabase (comptes)

npm run dev
```

Ouvre http://localhost:3000.

- **Sans clés Supabase** → mode local (localStorage), pas de connexion requise.
- **Avec Supabase** → comptes utilisateurs activés. Voir le guide pas à pas :
  [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) (table à créer via [`supabase/schema.sql`](supabase/schema.sql)).

## Fonctionnalités

- **Comptes utilisateurs** (Supabase Auth) avec données isolées par compte (Row Level Security).
- **KPIs éditables** vivants : objectif, progression, tendance, historique + sparkline.
- **Projets interactifs** : statut cyclable, sous-tâches cochables, échéance, réordonnables en drag & drop.
- **Modules dédiés** : bilan financier (Finances), domaines de notes (Knowledge), S.O.P (Business),
  objectifs (Vision).
- **Copilote IA par module** : connaît tes KPIs et projets en temps réel, en streaming.

## Build de production

```bash
npm run build
npm start
```

## Structure

```
app/
  api/chat/route.ts     # endpoint IA (Claude, streaming, auth requise)
  auth/                 # routes de connexion (callback, signout)
  login/page.tsx        # écran de connexion / inscription
  layout.tsx            # fonts + métadonnées
  page.tsx              # shell : navigation + dashboard + copilote
  globals.css           # thème
components/
  Dashboard.tsx         # en-tête + KPIs + corps du module
  KpiCard.tsx · ProjectCard.tsx · ProjectList.tsx
  FinanceLedger.tsx · KnowledgeView.tsx · SopView.tsx
  Home.tsx · DailyTodo.tsx · Assistant.tsx · ThemeToggle.tsx · Logo.tsx · Icon.tsx
lib/
  types.ts              # modèle de données
  domains.ts            # métadonnées des modules + contexte IA
  seed.ts               # données par défaut
  store.ts              # hook d'état : Supabase (cloud) ou localStorage (repli)
  supabase/             # clients + middleware d'auth
middleware.ts           # rafraîchissement de session + protection des routes
supabase/schema.sql     # table app_state + Row Level Security
```
