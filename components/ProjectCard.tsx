"use client";

import { useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";

const STATUS: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: "En cours", color: "#1f63c9" },
  planned: { label: "Planifié", color: "#a78bfa" },
  paused: { label: "En pause", color: "#fbbf24" },
  done: { label: "Terminé", color: "#a3e635" },
};

const STATUS_ORDER: ProjectStatus[] = ["planned", "active", "paused", "done"];

interface Props {
  project: Project;
  accent: string;
  onChange: (p: Project) => void;
  onDelete: () => void;
}

export function ProjectCard({ project, accent, onChange, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const st = STATUS[project.status];
  const doneTasks = project.tasks.filter((t) => t.done).length;

  function cycleStatus() {
    const i = STATUS_ORDER.indexOf(project.status);
    onChange({ ...project, status: STATUS_ORDER[(i + 1) % STATUS_ORDER.length] });
  }

  function toggleTask(id: string) {
    const tasks = project.tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    const done = tasks.filter((t) => t.done).length;
    const progress = tasks.length
      ? Math.round((done / tasks.length) * 100)
      : project.progress;
    onChange({ ...project, tasks, progress });
  }

  function addTask() {
    const label = prompt("Nouvelle tâche :");
    if (!label?.trim()) return;
    onChange({
      ...project,
      tasks: [
        ...project.tasks,
        { id: Math.random().toString(36).slice(2, 8), label: label.trim(), done: false },
      ],
    });
  }

  return (
    <div className="glass glass-hover rounded-xl p-4 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={cycleStatus}
              title="Changer le statut"
              className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors"
              style={{ borderColor: `${st.color}55`, color: st.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
              {st.label}
            </button>
          </div>
          <input
            value={project.name}
            onChange={(e) => onChange({ ...project, name: e.target.value })}
            className="mt-2 w-full truncate bg-transparent text-[15px] font-semibold text-white outline-none focus:text-accent-soft"
          />
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{project.description}</p>
          )}
        </div>
        <div className="font-mono text-lg font-semibold" style={{ color: accent }}>
          {project.progress}%
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${project.progress}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 hover:text-white"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${open ? "rotate-90" : ""}`}
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
          {doneTasks}/{project.tasks.length} tâches
          {project.due && (
            <span className="ml-2 font-mono opacity-70">
              · échéance {new Date(project.due).toLocaleDateString("fr-FR")}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1">
          {project.tags.map((t) => (
            <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
          {project.tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-[13px] hover:bg-white/5"
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                style={{
                  borderColor: t.done ? accent : "#2a2f40",
                  background: t.done ? accent : "transparent",
                }}
              >
                {t.done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#07080c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={t.done ? "text-muted line-through" : "text-white/90"}>
                {t.label}
              </span>
            </button>
          ))}

          <div className="flex items-center gap-3 pt-1">
            <input
              type="range"
              min={0}
              max={100}
              value={project.progress}
              onChange={(e) => onChange({ ...project, progress: Number(e.target.value) })}
              className="flex-1"
            />
            <button onClick={addTask} className="text-[11px] text-accent hover:text-accent-soft">
              + tâche
            </button>
            <button onClick={onDelete} className="text-[11px] text-muted hover:text-accent-rose">
              supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
