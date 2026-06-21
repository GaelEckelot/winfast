import type { AppData } from "./types";

/** Local ISO date (avoids UTC drift). */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Demo completion log for the current month (varied ratios, up to today). */
function seedHabitLog(habitIds: string[]): Record<string, string[]> {
  const log: Record<string, string[]> = {};
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  for (let day = 1; day <= today.getDate(); day++) {
    const ratio = (((day * 7 + 3) % 10) + 1) / 10; // 0.1 → 1.0, deterministic
    const count = Math.round(ratio * habitIds.length);
    log[iso(new Date(y, m, day))] = habitIds.slice(0, count);
  }
  return log;
}

const SANTE_HABIT_IDS = ["h1", "h2", "h3", "h4", "h5"];

/** Default seed data — realistic placeholders, fully editable & persisted in localStorage. */
export const SEED: AppData = {
  sante: {
    kpis: [
      { id: "k1", label: "Sommeil", value: 7.2, target: 8, unit: "h", trend: "up", delta: 4 },
      { id: "k2", label: "Pas / jour", value: 8400, target: 10000, unit: "", trend: "up", delta: 12 },
      { id: "k4", label: "Stress moyen", value: 38, target: 30, unit: "%", trend: "down", delta: -6 },
    ],
    projects: [
      {
        id: "p1",
        name: "Protocole sommeil",
        description: "Reconstruire un rythme circadien stable sur 30 jours.",
        status: "active",
        progress: 64,
        due: "2026-07-01",
        tags: ["sommeil", "routine"],
        tasks: [
          { id: "t1", label: "Couvre-feu écran 22h30", done: true },
          { id: "t2", label: "Lumière du matin 10 min", done: true },
          { id: "t3", label: "Pas de caféine après 14h", done: false },
        ],
      },
      {
        id: "p2",
        name: "Force & mobilité",
        description: "3 séances/semaine + mobilité quotidienne.",
        status: "active",
        progress: 41,
        due: "2026-09-01",
        tags: ["sport"],
        tasks: [
          { id: "t1", label: "Programme 3x/sem", done: true },
          { id: "t2", label: "Mobilité 10 min/jour", done: false },
        ],
      },
      {
        id: "p3",
        name: "Bilan biologique annuel",
        description: "Analyses sanguines complètes + interprétation.",
        status: "planned",
        progress: 0,
        tags: ["santé"],
        tasks: [{ id: "t1", label: "Prendre RDV labo", done: false }],
      },
    ],
    habits: {
      habits: [
        { id: "h1", label: "Méditation 10 min" },
        { id: "h2", label: "Sport / mobilité" },
        { id: "h3", label: "Pas d'écran après 22h30" },
        { id: "h4", label: "2 L d'eau" },
        { id: "h5", label: "Lecture 15 min" },
      ],
      log: seedHabitLog(SANTE_HABIT_IDS),
    },
  },
  finances: {
    kpis: [
      { id: "k2", label: "Épargne / mois", value: 2100, target: 2500, unit: "€", trend: "up", delta: 5 },
      { id: "k4", label: "Burn rate", value: 4050, target: 3800, unit: "€", trend: "down", delta: -3 },
    ],
    projects: [
      {
        id: "p1",
        name: "Fonds d'urgence 6 mois",
        description: "Atteindre 6 mois de dépenses en cash sécurisé.",
        status: "active",
        progress: 78,
        due: "2026-08-01",
        tags: ["sécurité"],
        tasks: [
          { id: "t1", label: "Ouvrir livret à 4%", done: true },
          { id: "t2", label: "Virement auto 600€/mois", done: true },
          { id: "t3", label: "Atteindre 24 000€", done: false },
        ],
      },
      {
        id: "p2",
        name: "Portefeuille long terme",
        description: "Allocation ETF World + obligations, rééquilibrage trimestriel.",
        status: "active",
        progress: 52,
        tags: ["invest"],
        tasks: [
          { id: "t1", label: "Définir allocation cible", done: true },
          { id: "t2", label: "DCA mensuel programmé", done: true },
          { id: "t3", label: "Rééquilibrer Q3", done: false },
        ],
      },
      {
        id: "p3",
        name: "Optimisation fiscale",
        description: "Revue PER / enveloppes fiscales avant fin d'année.",
        status: "planned",
        progress: 10,
        tags: ["fiscalité"],
        tasks: [{ id: "t1", label: "Simuler plafond PER", done: false }],
      },
    ],
    ledger: [
      {
        id: "c1",
        title: "Dépenses /an",
        role: "expenses",
        rows: [
          { id: "r1", label: "Loyer", amount: 9600 },
          { id: "r2", label: "Courses", amount: 4800 },
          { id: "r3", label: "Transport", amount: 1200 },
          { id: "r4", label: "Assurances", amount: 800 },
          { id: "r5", label: "Abonnements", amount: 600 },
          { id: "r6", label: "Loisirs", amount: 1500 },
        ],
      },
      {
        id: "c2",
        title: "Cashflow & liquidité",
        role: "cashflow",
        rows: [
          { id: "r1", label: "Salaire net", amount: 2500 },
          { id: "r2", label: "Compte courant", amount: 1200 },
          { id: "r3", label: "Livret épargne", amount: 5000 },
        ],
      },
      {
        id: "c3",
        title: "Asset & Investment",
        role: "assets",
        rows: [
          { id: "r1", label: "Actions", amount: 3000 },
          { id: "r2", label: "Crypto", amount: 1000 },
          { id: "r3", label: "Assurance vie", amount: 4000 },
        ],
      },
      {
        id: "c4",
        title: "Dettes",
        role: "debts",
        rows: [
          { id: "r1", label: "Prêt auto", amount: 6000 },
          { id: "r2", label: "Crédit conso", amount: 2000 },
        ],
      },
      {
        id: "c5",
        title: "Reste à payer",
        role: "topay",
        rows: [
          { id: "r1", label: "Facture énergie", amount: 200 },
          { id: "r2", label: "Impôts", amount: 900 },
        ],
      },
      {
        id: "c6",
        title: "BILAN",
        role: "notes",
        rows: [
          { id: "r1", label: "Objectif : 6 mois de dépenses en épargne de sécurité" },
        ],
      },
    ],
  },
  business: {
    kpis: [
      { id: "k1", label: "MRR", value: 14200, target: 20000, unit: "€", trend: "up", delta: 11 },
      { id: "k2", label: "Clients actifs", value: 86, target: 120, unit: "", trend: "up", delta: 7 },
      { id: "k3", label: "Churn", value: 3.4, target: 2.5, unit: "%", trend: "down", delta: -0.6 },
      { id: "k4", label: "Marge brute", value: 72, target: 78, unit: "%", trend: "flat", delta: 1 },
    ],
    projects: [
      {
        id: "p1",
        name: "Lancement offre Pro",
        description: "Nouvelle gamme tarifaire + page de vente.",
        status: "active",
        progress: 58,
        due: "2026-06-30",
        tags: ["produit", "revenus"],
        tasks: [
          { id: "t1", label: "Grille tarifaire validée", done: true },
          { id: "t2", label: "Landing page", done: true },
          { id: "t3", label: "Séquence email", done: false },
        ],
      },
      {
        id: "p2",
        name: "Pipeline acquisition",
        description: "Industrialiser le canal contenu + outbound.",
        status: "active",
        progress: 35,
        tags: ["growth"],
        tasks: [
          { id: "t1", label: "Calendrier éditorial", done: true },
          { id: "t2", label: "Script outbound", done: false },
        ],
      },
      {
        id: "p3",
        name: "Tableau de bord ops",
        description: "Centraliser les KPIs temps réel.",
        status: "paused",
        progress: 20,
        tags: ["ops"],
        tasks: [{ id: "t1", label: "Connecter les sources", done: false }],
      },
    ],
    sops: [
      {
        id: "s1",
        title: "Onboarding nouveau client",
        body:
          "Objectif : faire vivre une première expérience irréprochable au client dès la signature.\n\n" +
          "Délai cible : compte opérationnel sous 48h.\n" +
          "Responsable : toi (puis délégable).\n\n" +
          "Notes : adapter le ton à la taille du client. Tout passe par l'espace partagé.",
        steps: [
          { id: "st1", label: "Envoyer l'email de bienvenue + accès", done: true },
          { id: "st2", label: "Appel de cadrage (objectifs, KPIs)", done: true },
          { id: "st3", label: "Configurer le compte et les intégrations", done: false },
          { id: "st4", label: "Planifier le point de suivi à J+30", done: false },
        ],
      },
      {
        id: "s2",
        title: "Publication de contenu",
        steps: [
          { id: "st1", label: "Rédiger le brouillon", done: false },
          { id: "st2", label: "Relire et optimiser le SEO", done: false },
          { id: "st3", label: "Programmer + diffuser sur les canaux", done: false },
        ],
      },
    ],
    clients: [
      {
        id: "c1",
        company: "Atelier Nord",
        contact: "Camille Roy",
        stage: "lead",
        value: 4500,
        email: "camille@ateliernord.fr",
        nextAction: "Premier email de prise de contact",
        notes: "Vient d'un webinaire. Budget à confirmer.",
      },
      {
        id: "c2",
        company: "Studio Lumen",
        contact: "Hugo Mercier",
        stage: "contacted",
        value: 9000,
        email: "hugo@studiolumen.com",
        nextAction: "Caler un appel de découverte",
        notes: "A répondu, intéressé par l'offre annuelle.",
      },
      {
        id: "c3",
        company: "Maison Bleue",
        contact: "Sofia Lambert",
        stage: "proposal",
        value: 15000,
        email: "sofia@maisonbleue.fr",
        nextAction: "Relancer sur la proposition envoyée",
        notes: "Devis envoyé le 10. Décision sous 2 semaines.",
      },
      {
        id: "c4",
        company: "Groupe Vortex",
        contact: "Yanis Faure",
        stage: "won",
        value: 22000,
        email: "yanis@vortex.io",
        nextAction: "Lancer l'onboarding",
        notes: "Signé ! Contrat 12 mois.",
      },
      {
        id: "c5",
        company: "Pixel & Co",
        contact: "Léa Dubois",
        stage: "lost",
        value: 6000,
        email: "lea@pixelco.fr",
        nextAction: "Recontacter dans 6 mois",
        notes: "Parti chez un concurrent moins cher.",
      },
    ],
  },
  travail: {
    kpis: [
      { id: "k1", label: "Heures focus / sem", value: 22, target: 28, unit: "h", trend: "up", delta: 9 },
      { id: "k3", label: "Réunions / sem", value: 11, target: 8, unit: "", trend: "down", delta: -10 },
    ],
    projects: [
      {
        id: "p1",
        name: "Refonte présentation Q3",
        description: "Deck stratégique pour le comité de direction.",
        status: "active",
        progress: 45,
        due: "2026-06-20",
        tags: ["livrable"],
        tasks: [
          { id: "t1", label: "Structure & message", done: true },
          { id: "t2", label: "Données chiffrées", done: false },
          { id: "t3", label: "Design final", done: false },
        ],
      },
      {
        id: "p2",
        name: "Système Deep Work",
        description: "Blocs de focus protégés + revue hebdo.",
        status: "active",
        progress: 70,
        tags: ["productivité"],
        tasks: [
          { id: "t1", label: "Blocs 90 min matin", done: true },
          { id: "t2", label: "Notifications coupées", done: true },
          { id: "t3", label: "Revue du vendredi", done: false },
        ],
      },
      {
        id: "p3",
        name: "Onboarding nouveau collègue",
        description: "Documentation et plan des 30 premiers jours.",
        status: "planned",
        progress: 0,
        tags: ["équipe"],
        tasks: [{ id: "t1", label: "Rédiger le guide", done: false }],
      },
    ],
  },
  vision: {
    kpis: [
      { id: "k1", label: "Objectifs 2026", value: 5, target: 5, unit: "", trend: "flat", delta: 0 },
      { id: "k3", label: "Progression année", value: 34, target: 100, unit: "%", trend: "up", delta: 0, derived: "avg_progress" },
    ],
    projects: [
      {
        id: "p1",
        name: "Liberté financière — étape 1",
        description: "Objectif annuel : sécuriser 6 mois de réserve et lancer l'investissement long terme.",
        status: "active",
        progress: 58,
        due: "2026-12-31",
        tags: ["2026", "finances"],
        tasks: [
          { id: "t1", label: "T1 · Fonds d'urgence complété", done: true },
          { id: "t2", label: "T2 · Allocation d'investissement définie", done: true },
          { id: "t3", label: "T3 · DCA automatisé", done: false },
          { id: "t4", label: "T4 · Bilan patrimonial", done: false },
        ],
      },
      {
        id: "p2",
        name: "Lancer le produit phare",
        description: "Objectif annuel : passer le business à 20k de MRR avec l'offre Pro.",
        status: "active",
        progress: 40,
        due: "2026-12-31",
        tags: ["2026", "business"],
        tasks: [
          { id: "t1", label: "T1 · Offre & positionnement", done: true },
          { id: "t2", label: "T2 · Lancement public", done: false },
          { id: "t3", label: "T3 · Canal d'acquisition stable", done: false },
        ],
      },
      {
        id: "p3",
        name: "Forme physique au plus haut",
        description: "Objectif annuel : meilleure condition physique de ma vie (force, sommeil, énergie).",
        status: "active",
        progress: 30,
        due: "2026-12-31",
        tags: ["2026", "santé"],
        tasks: [
          { id: "t1", label: "T1 · Routine sommeil stable", done: true },
          { id: "t2", label: "T2 · 3 séances/sem tenues", done: false },
          { id: "t3", label: "T3 · Bilan biologique optimal", done: false },
        ],
      },
      {
        id: "p4",
        name: "Créer & publier",
        description: "Objectif annuel : construire une audience et publier régulièrement.",
        status: "planned",
        progress: 8,
        due: "2026-12-31",
        tags: ["2026", "création"],
        tasks: [
          { id: "t1", label: "Définir la ligne éditoriale", done: true },
          { id: "t2", label: "Publier chaque semaine", done: false },
        ],
      },
      {
        id: "p5",
        name: "Maîtriser l'IA au quotidien",
        description: "Objectif annuel : intégrer des agents et automatisations dans toute ma vie.",
        status: "active",
        progress: 35,
        due: "2026-12-31",
        tags: ["2026", "IA"],
        tasks: [
          { id: "t1", label: "Premier agent en production", done: true },
          { id: "t2", label: "Automatiser 5 routines clés", done: false },
        ],
      },
    ],
  },
  knowledge: {
    kpis: [
      { id: "k1", label: "Notes", value: 312, target: 400, unit: "", trend: "up", delta: 8 },
      { id: "k3", label: "Connexions", value: 128, target: 200, unit: "", trend: "up", delta: 10 },
    ],
    projects: [
      {
        id: "p1",
        name: "Second cerveau (PARA)",
        description: "Structurer notes en Projets / Domaines / Ressources / Archives.",
        status: "active",
        progress: 55,
        tags: ["système"],
        tasks: [
          { id: "t1", label: "Migrer les notes existantes", done: true },
          { id: "t2", label: "Définir les domaines", done: true },
          { id: "t3", label: "Revue mensuelle", done: false },
        ],
      },
      {
        id: "p2",
        name: "Synthèses de lecture IA",
        description: "Résumés structurés + cartes de révision automatiques.",
        status: "active",
        progress: 30,
        tags: ["IA", "lecture"],
        tasks: [
          { id: "t1", label: "Pipeline d'import", done: true },
          { id: "t2", label: "Template de synthèse", done: false },
        ],
      },
      {
        id: "p3",
        name: "Veille hebdomadaire",
        description: "Curation et archivage des meilleures sources.",
        status: "active",
        progress: 48,
        tags: ["veille"],
        tasks: [{ id: "t1", label: "Sélectionner 5 sources/sem", done: true }],
      },
    ],
    knowledge: [
      {
        id: "d1",
        title: "IA & LLMs",
        notes: "Notes sur les modèles, le prompting, les agents…\n\n- ",
      },
      {
        id: "d2",
        title: "Investissement",
        notes: "Thèses, stratégies, allocations…\n\n- ",
      },
      {
        id: "d3",
        title: "Productivité",
        notes: "Méthodes, systèmes, outils…\n\n- ",
      },
      {
        id: "d4",
        title: "Santé & longévité",
        notes: "Sommeil, nutrition, sport, protocoles…\n\n- ",
      },
    ],
  },
  agents: {
    kpis: [
      { id: "k1", label: "Agents déployés", value: 5, target: 10, unit: "", trend: "up", delta: 2 },
      { id: "k2", label: "Tâches automatisées", value: 142, target: 250, unit: "", trend: "up", delta: 18 },
      { id: "k3", label: "Taux de succès", value: 94, target: 98, unit: "%", trend: "up", delta: 2 },
      { id: "k4", label: "Temps gagné / sem", value: 9, target: 15, unit: "h", trend: "up", delta: 12 },
    ],
    projects: [
      {
        id: "p1",
        name: "Agent veille & résumés",
        description: "Surveille les sources, résume et alerte chaque matin.",
        status: "active",
        progress: 80,
        tags: ["veille", "auto"],
        tasks: [
          { id: "t1", label: "Définir déclencheur 7h", done: true },
          { id: "t2", label: "Connecter les sources", done: true },
          { id: "t3", label: "Format de rapport", done: false },
        ],
      },
      {
        id: "p2",
        name: "Agent inbox triage",
        description: "Classe, priorise et propose des réponses aux emails.",
        status: "active",
        progress: 47,
        tags: ["email"],
        tasks: [
          { id: "t1", label: "Règles de classement", done: true },
          { id: "t2", label: "Garde-fous validation", done: false },
        ],
      },
      {
        id: "p3",
        name: "Agent reporting business",
        description: "Compile les KPIs et génère le rapport hebdo.",
        status: "planned",
        progress: 12,
        tags: ["reporting"],
        tasks: [{ id: "t1", label: "Lister les métriques", done: false }],
      },
    ],
  },
};
