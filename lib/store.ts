"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppData, DomainId, DomainState, Kpi, Measurement, Project, TodoItem } from "./types";
import { SEED } from "./seed";

const STORAGE_KEY = "nexus-life-os:v1";
const TODOS_KEY = "nexus-life-os:todos:v1";
const NAME_KEY = "upper-life:name:v1";

function loadName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

const DEFAULT_TODOS: TodoItem[] = [
  { id: "d1", label: "Définir les 3 priorités de la journée", priority: "top1", done: false },
  { id: "d2", label: "Bloc de focus 90 min sur le projet clé", priority: "top1", done: false },
  { id: "d3", label: "Avancer un objectif Vision du trimestre", priority: "top2", done: false },
  { id: "d4", label: "Séance sport / mobilité", priority: "top2", done: false },
  { id: "d5", label: "Revue rapide des finances", priority: "top3", done: false },
];

function loadTodos(): TodoItem[] {
  if (typeof window === "undefined") return DEFAULT_TODOS;
  try {
    const raw = window.localStorage.getItem(TODOS_KEY);
    if (!raw) return DEFAULT_TODOS;
    const parsed = JSON.parse(raw) as TodoItem[];
    return Array.isArray(parsed) ? parsed : DEFAULT_TODOS;
  } catch {
    return DEFAULT_TODOS;
  }
}

/** Fabricate a plausible measurement history ending exactly at the current value. */
function synthHistory(value: number, delta: number, n = 8): Measurement[] {
  const start = delta ? value / (1 + delta / 100) : value * 0.94;
  const spread = Math.abs(value - start) || Math.abs(value) * 0.05 || 1;
  const today = new Date();
  const pts: Measurement[] = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    const base = start + (value - start) * f;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * spread * 0.12;
    const v = i === n - 1 ? value : Math.max(0, Math.round((base + noise) * 10) / 10);
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i) * 4);
    pts.push({ t: d.toISOString().slice(0, 10), v });
  }
  return pts;
}

/** Ensure every KPI carries a history (synthesize one for legacy/seed data). */
function normalize(data: AppData): AppData {
  const ids = Object.keys(data) as DomainId[];
  const out = {} as AppData;
  for (const id of ids) {
    const s = data[id];
    const seedKpis = SEED[id]?.kpis ?? [];
    out[id] = {
      ...s,
      ledger: s.ledger ?? SEED[id].ledger,
      knowledge: s.knowledge ?? SEED[id].knowledge,
      sops: s.sops ?? SEED[id].sops,
      kpis: s.kpis.map((k) => {
        const withHist =
          k.history && k.history.length >= 2 ? k : { ...k, history: synthHistory(k.value, k.delta) };
        // Re-apply auto-computed flags from seed (by id) to previously saved KPIs.
        const seedK = seedKpis.find((sk) => sk.id === k.id);
        return seedK?.derived ? { ...withHist, derived: seedK.derived } : withHist;
      }),
    };
  }
  return out;
}

function loadInitial(): AppData {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize(SEED);
    const parsed = JSON.parse(raw) as Record<string, DomainState>;
    // Rebuild strictly from current domains: keep saved data for known modules,
    // seed any new module (e.g. Vision), and drop obsolete ones (e.g. Skills).
    const ids = Object.keys(SEED) as DomainId[];
    const merged = {} as AppData;
    for (const id of ids) merged[id] = parsed[id] ?? SEED[id];
    return normalize(merged);
  } catch {
    return normalize(SEED);
  }
}

export interface Store {
  data: AppData;
  todos: TodoItem[];
  name: string;
  hydrated: boolean;
  update: (domain: DomainId, updater: (s: DomainState) => DomainState) => void;
  addTodo: () => void;
  updateTodo: (id: string, patch: Partial<TodoItem>) => void;
  removeTodo: (id: string) => void;
  moveTodo: (from: number, to: number) => void;
  setName: (name: string) => void;
  reset: () => void;
}

export function useStore(): Store {
  const [data, setData] = useState<AppData>(SEED);
  const [todos, setTodos] = useState<TodoItem[]>(DEFAULT_TODOS);
  const [name, setNameState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadInitial());
    setTodos(loadTodos());
    setNameState(loadName());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota or privacy mode — ignore */
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
    } catch {
      /* ignore */
    }
  }, [todos, hydrated]);

  const update = useCallback(
    (domain: DomainId, updater: (s: DomainState) => DomainState) => {
      setData((prev) => ({ ...prev, [domain]: updater(prev[domain]) }));
    },
    [],
  );

  const addTodo = useCallback(() => {
    setTodos((prev) => [
      ...prev,
      { id: newId(), label: "", priority: "top2", done: false },
    ]);
  }, []);

  const updateTodo = useCallback((id: string, patch: Partial<TodoItem>) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTodo = useCallback((from: number, to: number) => {
    setTodos((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const setName = useCallback((value: string) => {
    const v = value.trim();
    setNameState(v);
    try {
      window.localStorage.setItem(NAME_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    setData(normalize(SEED));
    setTodos(DEFAULT_TODOS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TODOS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { data, todos, name, hydrated, update, addTodo, updateTodo, removeTodo, moveTodo, setName, reset };
}

/** Convenience: derive aggregate progress for a domain (avg of active projects). */
export function domainHealth(state: DomainState): number {
  const active = state.projects.filter((p) => p.status !== "done");
  if (active.length === 0) return 100;
  return Math.round(
    active.reduce((acc, p) => acc + p.progress, 0) / active.length,
  );
}

export interface ModuleSummary {
  health: number;
  activeProjects: number;
  totalProjects: number;
  kpiCount: number;
  /** Average progress of non-done projects. */
  momentum: number;
  topKpi?: { label: string; value: number; unit: string };
}

export function summarize(state: DomainState): ModuleSummary {
  const active = state.projects.filter((p) => p.status !== "done");
  const momentum = active.length
    ? Math.round(active.reduce((a, p) => a + p.progress, 0) / active.length)
    : 0;
  const top = state.kpis[0];
  return {
    health: domainHealth(state),
    activeProjects: state.projects.filter((p) => p.status === "active").length,
    totalProjects: state.projects.length,
    kpiCount: state.kpis.length,
    momentum,
    topKpi: top ? { label: top.label, value: top.value, unit: top.unit } : undefined,
  };
}

/** Builds a synthetic DomainState used to ground the global (home) copilot. */
export function globalState(data: AppData, labels: Record<string, string>): DomainState {
  const ids = Object.keys(data) as DomainId[];
  const kpis = ids.map((id) => {
    const h = domainHealth(data[id]);
    return {
      id: `g-${id}`,
      label: labels[id] ?? id,
      value: h,
      target: 100,
      unit: "%",
      trend: trendFromDelta(h - 70),
      delta: 0,
    };
  });
  const projects = ids.flatMap((id) =>
    data[id].projects
      .filter((p) => p.status === "active")
      .map((p) => ({ ...p, name: `[${labels[id] ?? id}] ${p.name}` })),
  );
  return { kpis, projects };
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function emptyKpi(): Kpi {
  return {
    id: newId(),
    label: "Nouveau KPI",
    value: 0,
    target: 100,
    unit: "",
    trend: "flat",
    delta: 0,
  };
}

/** Trend is derived from the sign of the period-over-period delta. */
export function trendFromDelta(delta: number): Kpi["trend"] {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

export function emptyProject(): Project {
  return {
    id: newId(),
    name: "Nouveau projet",
    description: "",
    status: "planned",
    progress: 0,
    tags: [],
    tasks: [],
  };
}
