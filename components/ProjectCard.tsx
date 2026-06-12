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
  /** Shows a drag handle that arms native drag on the parent wrapper. */
  reorderable?: boolean;
}

/** Toggle `draggable` directly on the closest wrapper (synchronously, so the
 *  browser sees it before `dragstart` fires — a React state update would be
 *  too late and the drag would never start). */
function setWrapperDraggable(el: HTMLElement, on: boolean) {
  const wrap = el.closest<HTMLElement>("[data-drag-wrapper]");
  if (wrap) wrap.draggable = on;
}

export function ProjectCard({ project, accent, onChange, onDelete, reorderable }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const st = STATUS[project.status];
  const doneTasks = project.tasks.filter((t) => t.done).length;

  function cycleStatus() {
    const i = STATUS_ORDER.indexOf(project.status);
    onChange({ ...project, status: STATUS_ORDER[(i + 1) % STATUS_ORDER.length] });
  }

  /** Progress derived from tasks (done / total); keeps manual value if no tasks. */
  function progressFrom(tasks: Project["tasks"]): number {
    return tasks.length
      ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)
      : project.progress;
  }

  function commitTasks(tasks: Project["tasks"]) {
    onChange({ ...project, tasks, progress: progressFrom(tasks) });
  }

  function toggleTask(id: string) {
    commitTasks(project.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask() {
    const label = draft.trim();
    if (!label) return;
    commitTasks([
      ...project.tasks,
      { id: Math.random().toString(36).slice(2, 8), label, done: false },
    ]);
    setDraft("");
  }

  function removeTask(id: string) {
    commitTasks(project.tasks.filter((t) => t.id !== id));
  }

  return (
    <div className="glass glass-hover rounded-xl p-4 animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {reorderable && (
              <span
                onMouseDown={(e) => setWrapperDraggable(e.currentTarget, true)}
                onMouseUp={(e) => setWrapperDraggable(e.currentTarget, false)}
                onTouchStart={(e) => setWrapperDraggable(e.currentTarget, true)}
                onTouchEnd={(e) => setWrapperDraggable(e.currentTarget, false)}
                title="Glisser pour réordonner"
                aria-label="Glisser pour réordonner"
                className="-ml-1 flex h-5 w-4 shrink-0 cursor-grab items-center justify-center text-muted opacity-40 transition-opacity hover:opacity-80 active:cursor-grabbing"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </span>
            )}
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
            className="mt-2 w-full truncate bg-transparent text-[15px] font-semibold text-ink outline-none focus:text-accent-soft"
          />
          {project.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{project.description}</p>
          )}
        </div>
        <div className="font-mono text-lg font-semibold" style={{ color: accent }}>
          {project.progress}%
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line/5">
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
          className="flex items-center gap-1 hover:text-ink"
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
      </div>

      {open && (
        <div className="mt-3 space-y-1 border-t border-line/5 pt-3">
          {project.tasks.map((t) => (
            <div key={t.id} className="group/task flex items-center gap-2 rounded-md px-1 py-1 hover:bg-line/5">
              <button
                onClick={() => toggleTask(t.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-[13px]"
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
                <span className={t.done ? "truncate text-muted line-through" : "truncate text-ink/90"}>
                  {t.label}
                </span>
              </button>
              <button
                onClick={() => removeTask(t.id)}
                className="shrink-0 text-muted opacity-0 transition-opacity hover:text-accent-rose group-hover/task:opacity-100"
                aria-label="Supprimer la tâche"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add task (inline) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }}
            className="flex items-center gap-2 px-1 pt-0.5"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-line/15 text-muted">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ajouter une tâche…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink/90 outline-none placeholder:text-muted/60"
            />
          </form>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-muted">
            <span>Échéance</span>
            <input
              type="date"
              value={project.due ?? ""}
              onChange={(e) => onChange({ ...project, due: e.target.value || undefined })}
              className="rounded bg-line/5 px-1.5 py-0.5 font-mono text-[11px] text-ink/90 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="range"
              min={0}
              max={100}
              value={project.progress}
              onChange={(e) => onChange({ ...project, progress: Number(e.target.value) })}
              className="flex-1"
              title="Ajuster manuellement la progression"
            />
            <button onClick={onDelete} className="text-[11px] text-muted hover:text-accent-rose">
              supprimer le projet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
