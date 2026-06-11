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
