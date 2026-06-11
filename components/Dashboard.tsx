"use client";

import type { DomainMeta, DomainState, Kpi, Project } from "@/lib/types";
import { domainHealth, emptyKpi, emptyProject } from "@/lib/store";
import { Icon } from "./Icon";
import { KpiCard } from "./KpiCard";
import { ProjectCard } from "./ProjectCard";

interface Props {
  domain: DomainMeta;
  state: DomainState;
  onChange: (updater: (s: DomainState) => DomainState) => void;
}

export function Dashboard({ domain, state, onChange }: Props) {
  const health = domainHealth(state);
  const activeCount = state.projects.filter((p) => p.status === "active").length;

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

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {domain.label}
              </h1>
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

        <div className="flex items-center gap-5">
          <Stat label="Santé du module" value={`${health}%`} accent={domain.accent} />
          <Stat label="Projets actifs" value={String(activeCount)} accent={domain.accent} />
        </div>
      </div>

      {/* KPIs */}
      <section className="mt-5">
        <div className="flex items-center justify-between">
          <SectionTitle>Indicateurs clés</SectionTitle>
          <button
            onClick={addKpi}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/25 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau KPI
          </button>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {state.kpis.map((k) => (
            <KpiCard
              key={k.id}
              kpi={k}
              accent={domain.accent}
              onChange={updateKpi}
              onDelete={() => deleteKpi(k.id)}
            />
          ))}
          {state.kpis.length === 0 && (
            <div className="glass col-span-full rounded-xl p-6 text-center text-sm text-muted">
              Aucun indicateur. Ajoute ton premier KPI.
            </div>
          )}
        </div>
      </section>

      {/* Projects */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <SectionTitle>Projets en cours</SectionTitle>
          <button
            onClick={addProject}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/25 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau projet
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {state.projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              accent={domain.accent}
              onChange={updateProject}
              onDelete={() => deleteProject(p.id)}
            />
          ))}
          {state.projects.length === 0 && (
            <div className="glass col-span-full rounded-xl p-8 text-center text-sm text-muted">
              Aucun projet. Crée ton premier projet pour ce module.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
      {children}
    </h2>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="text-right">
      <div className="font-mono text-xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
