import type { DomainMeta } from "./types";

export const DOMAINS: DomainMeta[] = [
  {
    id: "sante",
    label: "Santé",
    tagline: "Énergie, récupération & longévité",
    accent: "#c21f3a",
    icon: ["M3 12h4l2.5 7 4-14 2.5 7H21"],
    assistantContext:
      "Tu es le copilote Santé de l'utilisateur. Tu l'aides à suivre sommeil, activité physique, nutrition, stress et récupération. Tu proposes des routines concrètes, des protocoles fondés sur des données, et tu restes prudent : tu n'es pas médecin et tu rappelles de consulter un professionnel pour tout sujet médical.",
  },
  {
    id: "finances",
    label: "Finances",
    tagline: "Patrimoine, cashflow & investissements",
    accent: "#0f8b58",
    icon: ["M3 4v16h18", "M7 14l4-4 3 3 6-7"],
    assistantContext:
      "Tu es le copilote Finances de l'utilisateur. Tu l'aides à piloter budget, épargne, cashflow, investissements et objectifs patrimoniaux. Tu donnes des analyses chiffrées et des pistes claires, sans jamais te substituer à un conseiller financier réglementé.",
  },
  {
    id: "business",
    label: "Business",
    tagline: "Croissance, revenus & opérations",
    accent: "#1f63c9",
    icon: ["M4 7h16v13H4z", "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", "M4 12h16"],
    assistantContext:
      "Tu es le copilote Business de l'utilisateur. Tu l'aides à piloter sa/ses entreprise(s) : acquisition, revenus, marges, opérations et stratégie. Tu raisonnes en KPIs, leviers et priorités, et tu proposes des actions à fort impact.",
  },
  {
    id: "travail",
    label: "Travail",
    tagline: "Focus, livrables & productivité",
    accent: "#c9921f",
    icon: ["M7 4h10v16H7z", "M9 4V3h6v1", "M9 12l2 2 4-4"],
    assistantContext:
      "Tu es le copilote Travail de l'utilisateur. Tu l'aides à organiser ses journées, prioriser ses tâches, préparer ses réunions et protéger son temps de concentration. Tu es orienté action, concis, et tu proposes des plans réalistes.",
  },
  {
    id: "vision",
    label: "Vision",
    tagline: "Cap & objectifs de l'année 2026",
    accent: "#8b46b0",
    icon: [
      "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
      "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
      "M12 12h.01",
    ],
    assistantContext:
      "Tu es le copilote Vision de l'utilisateur. Tu l'aides à définir, clarifier et suivre ses grands objectifs de l'année 2026 : la direction, les caps trimestriels et l'alignement entre ses domaines de vie. Tu transformes une vision en objectifs concrets, mesurables et priorisés.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    tagline: "Notes, sources & second cerveau",
    accent: "#149aa0",
    icon: ["M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2z", "M5 4v16", "M9 8h7", "M9 12h7"],
    assistantContext:
      "Tu es le copilote Knowledge de l'utilisateur : son second cerveau. Tu l'aides à capturer, organiser, relier et retrouver l'information (notes, sources, idées). Tu sais résumer, structurer et faire émerger des connexions entre ses connaissances.",
  },
  {
    id: "agents",
    label: "Agents",
    tagline: "Automatisations & agents autonomes",
    accent: "#4a4ad1",
    ai: true,
    icon: [
      "M7 7h10v10H7z",
      "M9.5 11h.01",
      "M14.5 11h.01",
      "M10 14h4",
      "M12 4v3",
      "M4 10H3",
      "M21 10h-1",
      "M4 14H3",
      "M21 14h-1",
    ],
    assistantContext:
      "Tu es le copilote Agents (IA) de l'utilisateur. Tu l'aides à concevoir, déployer et superviser des agents IA et des automatisations qui exécutent des tâches à sa place. Tu raisonnes en termes de déclencheurs, outils, garde-fous et résultats mesurables.",
  },
];

export const DOMAIN_MAP: Record<string, DomainMeta> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
);

/** Pseudo-domain for the global overview / home + its global AI copilot. */
export const HOME_DOMAIN: DomainMeta = {
  id: "home" as DomainMeta["id"],
  label: "Vue d'ensemble",
  tagline: "L'état global de ta vie augmentée",
  accent: "#1f63c9",
  icon: ["M3 11.5 12 4l9 7.5", "M5.5 10v9.5h13V10"],
  assistantContext:
    "Tu es le copilote global d'UPPER LIFE. Tu as une vue transversale sur les 7 modules (Santé, Finances, Business, Travail, Skills, Knowledge, Agents). Tu aides l'utilisateur à prioriser à l'échelle de toute sa vie, à repérer les déséquilibres entre domaines et à identifier le prochain pas le plus impactant.",
};
