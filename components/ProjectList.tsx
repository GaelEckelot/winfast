"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: Project[];
  accent: string;
  title: string;
  addLabel: string;
  emptyText: string;
  /** One project per line (no 2-column grid). */
  singleColumn?: boolean;
  /** When set, cards show a numbered overline (e.g. "Objectif"). */
  overlineWord?: string;
  onUpdate: (p: Project) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onMove: (from: number, to: number) => void;
  /** Outer section spacing (defaults to top margin). */
  className?: string;
}

export function ProjectList({
  projects,
  accent,
  title,
  addLabel,
  emptyText,
  singleColumn,
  overlineWord,
  onUpdate,
  onDelete,
  onAdd,
  onMove,
  className = "mt-8",
}: Props) {
  // Drag & drop reordering (same UX as the Knowledge view).
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <section className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg border border-line/10 px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-line/25 hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {addLabel}
        </button>
      </div>
      <div className={`mt-3 grid grid-cols-1 gap-3 ${singleColumn ? "" : "lg:grid-cols-2"}`}>
        {projects.map((p, i) => (
          <div
            key={p.id}
            data-drag-wrapper
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== i) {
                onMove(dragIndex, i);
                setDragIndex(i);
              }
            }}
            onDragEnd={(e) => {
              e.currentTarget.draggable = false;
              setDragIndex(null);
            }}
            className={`transition-opacity ${dragIndex === i ? "opacity-40" : ""}`}
          >
            <ProjectCard
              project={p}
              accent={accent}
              onChange={onUpdate}
              onDelete={() => onDelete(p.id)}
              reorderable
              overline={overlineWord ? `${overlineWord} ${i + 1}` : undefined}
            />
          </div>
        ))}
        {projects.length === 0 && (
          <div className="glass col-span-full rounded-xl p-8 text-center text-sm text-muted">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}
