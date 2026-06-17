# WinFast — Augmented OS

Dashboard **minimaliste & futuriste** pour piloter sa vie, augmenté par l'IA.
Sept modules de management, chacun avec ses KPIs, ses projets en cours et un **copilote IA** (Claude) contextualisé.

## Modules

| Module | Contenu |
|---|---|
| **Santé** | Sommeil, activité, récupération, stress |
| **Finances** | Patrimoine, cashflow, investissements |
| **Business** | MRR, clients, marges, opérations |
| **Travail** | Focus, livrables, productivité |
| **Skills** (AI) | Apprentissage augmenté, parcours générés |
| **Knowledge** | Notes, sources, second cerveau |
| **Agents** (AI) | Automatisations & agents autonomes |

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** — thème sombre, glassmorphism, accents néon
- **Persistance locale** : toutes les données vivent dans le `localStorage` du navigateur (aucun backend de base de données)
- **IA réelle** : route serveur `/api/chat` qui appelle l'API **Claude** (`claude-opus-4-8`) en streaming. La clé API reste côté serveur, jamais exposée au client.

## Démarrage

```bash
npm install

# Configurer la clé API (nécessaire pour le copilote IA)
cp .env.local.example .env.local
# puis éditer .env.local et renseigner ANTHROPIC_API_KEY

npm run dev
```

Ouvre http://localhost:3000.

> **Gratuit par défaut.** Sans clé API, l'app fonctionne entièrement (modules, KPIs, projets, persistance). Le copilote IA s'affiche alors en mode « bientôt disponible » et s'active automatiquement dès qu'une clé `ANTHROPIC_API_KEY` est ajoutée — aucune autre étape.

## Fonctionnalités

- **KPIs éditables** avec objectif, progression et tendance.
- **Projets interactifs** : statut cyclable, sous-tâches cochables (la progression se recalcule), slider de progression, tags, ajout/suppression.
- **Copilote IA par module** : connaît tes KPIs et projets en temps réel, propose priorités et prochaines actions. Streaming token-par-token.
- **Tout est persistant** en local et **réinitialisable** en un clic.

## Build de production

```bash
npm run build
npm start
```

## Structure

```
app/
  api/chat/route.ts   # endpoint IA (Claude, streaming, server-side)
  layout.tsx          # fonts + métadonnées
  page.tsx            # shell : navigation + dashboard + copilote
  globals.css         # thème
components/
  Dashboard.tsx       # en-tête + KPIs + projets d'un module
  KpiCard.tsx
  ProjectCard.tsx
  Assistant.tsx       # panneau de chat IA
  Icon.tsx
lib/
  types.ts            # modèle de données
  domains.ts          # métadonnées des 7 modules + contexte IA
  seed.ts             # données par défaut
  store.ts            # hook localStorage
```
