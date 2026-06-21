"use client";

import { useEffect, useRef } from "react";
import type {
  DomainMeta,
  DomainState,
  HabitTracker as HabitTrackerData,
  Kpi,
  KnowledgeDomain,
  LedgerColumn,
  Project,
  Sop,
} from "@/lib/types";
import { emptyHabitTracker, emptyKpi, emptyProject } from "@/lib/store";
import { Icon } from "./Icon";
import { KpiCard } from "./KpiCard";
import { ProjectList } from "./ProjectList";
import { FinanceLedger } from "./FinanceLedger";
import { KnowledgeView } from "./KnowledgeView";
import { HabitTracker } from "./HabitTracker";
import { BusinessBody } from "./SopView";

interface Props {
  domain: DomainMeta;
  state: DomainState;
  onChange: (updater: (s: DomainState) => DomainState) => void;
}

export function Dashboard({ domain, state, onChange }: Props) {
  // Only autofocus a KPI created after the initial mount (via "Nouveau KPI").
  const kpiMounted = useRef(false);
  useEffect(() => {
    kpiMounted.current = true;
  }, []);

  function moveProject(from: number, to: number) {
    onChange((s) => {
      const next = [...s.projects];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...s, projects: next };
    });
  }

  function updateKpi(k: Kpi) {
    onChange((s) => ({ ...s, kpis: s.kpis.map((x) => (x.id === k.id ? k : x)) }));
  }

  function deleteKpi(id: string) {
    onChange((s) => ({ ...s, kpis: s.kpis.filter((x) => x.id !== id) }));
  }

  function addKpi() {
    onChange((s) => ({ ...s, kpis: [...s.kpis, emptyKpi()] }));
  }

  function updateProject(p: Project) {
    onChange((s) => ({
      ...s,
      projects: s.projects.map((x) => (x.id === p.id ? p : x)),
    }));
  }

  function deleteProject(id: string) {
    onChange((s) => ({ ...s, projects: s.projects.filter((x) => x.id !== id) }));
  }

  function addProject() {
    onChange((s) => ({ ...s, projects: [emptyProject(), ...s.projects] }));
  }

  function updateLedger(next: LedgerColumn[]) {
    onChange((s) => ({ ...s, ledger: next }));
  }

  function updateKnowledge(next: KnowledgeDomain[]) {
    onChange((s) => ({ ...s, knowledge: next }));
  }

  function updateSops(next: Sop[]) {
    onChange((s) => ({ ...s, sops: next }));
  }

  function updateHabits(next: HabitTrackerData) {
    onChange((s) => ({ ...s, habits: next }));
  }

  const isFinance = domain.id === "finances";
  const isHealth = domain.id === "sante";
  const isKnowledge = domain.id === "knowledge";
  const isVision = domain.id === "vision";
  const isBusiness = domain.id === "business";
  const hasProjects = !isFinance && !isKnowledge;

  const projectCommon = {
    projects: state.projects,
    accent: domain.accent,
    onUpdate: updateProject,
    onDelete: deleteProject,
    onAdd: addProject,
    onMove: moveProject,
  };

  const tasksTotal = state.projects.reduce((a, p) => a + p.tasks.length, 0);
  const tasksDone = state.projects.reduce(
    (a, p) => a + p.tasks.filter((t) => t.done).length,
    0,
  );

  // Average progress across projects — feeds derived KPIs (e.g. Vision "Progression année").
  const avgProgress = state.projects.length
    ? Math.round(state.projects.reduce((a, p) => a + p.progress, 0) / state.projects.length)
    : 0;
  const effectiveKpi = (k: Kpi): Kpi =>
    k.derived === "avg_progress" ? { ...k, value: avgProgress } : k;

  return (
    <div className="animate-fade-up">
      {/* Header: title (left) + KPIs (right), vertically aligned on one line */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <div className="flex shrink-0 items-center gap-3.5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${domain.accent}22, transparent)`,
              border: `1px solid ${domain.accent}44`,
              color: domain.accent,
            }}
          >
            <Icon paths={domain.icon} size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{domain.label}</h1>
              {domain.ai && (
                <span
                  className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  style={{ borderColor: `${domain.accent}55`, color: domain.accent }}
                >
                  AI
                </span>
              )}
            </div>
            <p className="text-sm text-muted">{domain.tagline}</p>
          </div>
        </div>

        <div className="min-w-[280px] flex-1">
          <div className="relative flex items-center justify-center">
            <SectionTitle>Indicateurs clés</SectionTitle>
            <button
              onClick={addKpi}
              className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-lg border border-line/10 px-2.5 py-1 text-xs font-medium text-ink/80 transition-colors hover:border-line/25 hover:text-ink"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nouveau KPI
            </button>
          </div>
          <div
            className={`mt-2 grid auto-rows-fr grid-cols-2 items-stretch gap-2.5 ${hasProjects ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
          >
            {hasProjects && (
              <TasksCard done={tasksDone} total={tasksTotal} accent={domain.accent} />
            )}
            {state.kpis.map((k) => (
              <KpiCard
                key={k.id}
                kpi={effectiveKpi(k)}
                accent={domain.accent}
                onChange={updateKpi}
                onDelete={() => deleteKpi(k.id)}
                readOnly={!!k.derived}
                autoFocus={kpiMounted.current && !k.derived}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Santé-specific: habit tracker (checklist + monthly heatmap) above projects */}
      {isHealth && (
        <HabitTracker
          data={state.habits ?? emptyHabitTracker()}
          accent={domain.accent}
          onChange={updateHabits}
        />
      )}

      {/* Module-specific body: Finances → ledger, Knowledge → domains,
          Business → SOP + projects (2 cols), others → projects */}
      {isFinance ? (
        <FinanceLedger
          columns={state.ledger ?? []}
          accent={domain.accent}
          onChange={updateLedger}
        />
      ) : isKnowledge ? (
        <KnowledgeView
          domains={state.knowledge ?? []}
          accent={domain.accent}
          onChange={updateKnowledge}
        />
      ) : isBusiness ? (
        <BusinessBody
          sops={state.sops ?? []}
          accent={domain.accent}
          onChange={updateSops}
          projectList={
            <ProjectList
              {...projectCommon}
              title="Projets en cours"
              addLabel="Nouveau projet"
              emptyText="Aucun projet. Crée ton premier projet pour ce module."
              singleColumn
              className=""
            />
          }
        />
      ) : (
        <ProjectList
          {...projectCommon}
          title={isVision ? "Objectifs" : "Projets en cours"}
          addLabel={isVision ? "Nouvel objectif" : "Nouveau projet"}
          emptyText={
            isVision
              ? "Aucun objectif. Crée ton premier objectif."
              : "Aucun projet. Crée ton premier projet pour ce module."
          }
          singleColumn={isVision}
          overlineWord={isVision ? "Objectif" : undefined}
        />
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{children}</h2>
  );
}

/** Read-only, live-updating card: tasks done / total across the module's projects. */
function TasksCard({ done, total, accent }: { done: number; total: number; accent: string }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="glass flex h-full flex-col rounded-xl p-3">
      <span className="text-[10px] uppercase tracking-wider text-muted">Tâches</span>
      <div className="mt-1 font-mono text-lg font-semibold" style={{ color: accent }}>
        {done}
        <span className="text-muted">/{total}</span>
      </div>
      <div className="mt-auto h-1 w-full overflow-hidden rounded-full bg-line/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
        />
      </div>
      <div className="mt-1 text-[10px] font-mono text-muted">{pct}% faites</div>
    </div>
  );
}
