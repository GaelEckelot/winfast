export type DomainId =
  | "sante"
  | "finances"
  | "business"
  | "travail"
  | "vision"
  | "knowledge"
  | "agents";

export type Trend = "up" | "down" | "flat";

/** A single dated measurement of a KPI. */
export interface Measurement {
  /** ISO date (YYYY-MM-DD). */
  t: string;
  v: number;
}

export interface Kpi {
  id: string;
  label: string;
  /** Current numeric value (= last measurement). */
  value: number;
  /** Target / goal value. */
  target: number;
  unit: string;
  trend: Trend;
  /** % change vs previous measurement, signed. */
  delta: number;
  /** Chronological history of measurements (oldest → newest). */
  history?: Measurement[];
  /** If set, the value is computed automatically (read-only). */
  derived?: "avg_progress";
}

/** A free-note knowledge area (Knowledge module). */
export interface KnowledgeDomain {
  id: string;
  title: string;
  notes: string;
}

/** A single trackable habit (Santé module). */
export interface Habit {
  id: string;
  label: string;
}

/** Habit tracker state: habits + daily completion log (Santé module). */
export interface HabitTracker {
  habits: Habit[];
  /** ISO date (YYYY-MM-DD) → ids of habits completed that day. */
  log: Record<string, string[]>;
}

/** A single step of a Standard Operating Procedure (Business module). */
export interface SopStep {
  id: string;
  label: string;
  done: boolean;
}

/** A Standard Operating Procedure — an openable, document-style procedure page. */
export interface Sop {
  id: string;
  title: string;
  /** Free-text document body (the procedure written as text). */
  body?: string;
  steps: SopStep[];
}

/** Pipeline stage of a CRM client (Business module). */
export type CrmStage = "lead" | "contacted" | "proposal" | "won" | "lost";

/** A CRM client / deal (Business module). */
export interface Client {
  id: string;
  company: string;
  contact: string;
  stage: CrmStage;
  /** Deal value in €. */
  value: number;
  email: string;
  nextAction: string;
  notes: string;
}

export type ProjectStatus = "active" | "planned" | "paused" | "done";

export interface Task {
  id: string;
  label: string;
  done: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  /** 0-100 */
  progress: number;
  due?: string;
  tags: string[];
  tasks: Task[];
}

export interface DomainState {
  kpis: Kpi[];
  projects: Project[];
  /** Finance-specific balance sheet (only used by the Finances module). */
  ledger?: LedgerColumn[];
  /** Knowledge-specific free-note domains (only used by the Knowledge module). */
  knowledge?: KnowledgeDomain[];
  /** Business-specific Standard Operating Procedures (only used by the Business module). */
  sops?: Sop[];
  /** Business-specific CRM clients / deals (only used by the Business module). */
  clients?: Client[];
  /** Health-specific habit tracker (only used by the Santé module). */
  habits?: HabitTracker;
}

export type LedgerRole =
  | "expenses"
  | "cashflow"
  | "assets"
  | "debts"
  | "topay"
  | "notes";

export interface LedgerRow {
  id: string;
  label: string;
  /** Amount in €. Undefined for note rows. */
  amount?: number;
}

export interface LedgerColumn {
  id: string;
  title: string;
  role: LedgerRole;
  rows: LedgerRow[];
}

export type AppData = Record<DomainId, DomainState>;

export interface DomainMeta {
  id: DomainId;
  label: string;
  /** Short tagline shown in header. */
  tagline: string;
  /** Accent color token (tailwind class fragment / hex). */
  accent: string;
  /** Inline SVG path data for the icon (24x24 viewBox, stroke). One <path> per entry. */
  icon: string[];
  /** Whether this domain is AI-centric (badge). */
  ai?: boolean;
  /** System prompt context for the AI assistant of this domain. */
  assistantContext: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type Priority = "top1" | "top2" | "top3";

export interface TodoItem {
  id: string;
  label: string;
  priority: Priority;
  done: boolean;
}
