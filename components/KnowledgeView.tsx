"use client";

import { useState } from "react";
import type { KnowledgeDomain } from "@/lib/types";

interface Props {
  domains: KnowledgeDomain[];
  accent: string;
  onChange: (next: KnowledgeDomain[]) => void;
}

export function KnowledgeView({ domains, accent, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const selected = domains.find((d) => d.id === selectedId) ?? null;

  function update(id: string, patch: Partial<KnowledgeDomain>) {
    onChange(domains.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }
  function add() {
    const id = Math.random().toString(36).slice(2, 8);
    onChange([...domains, { id, title: "Nouveau domaine", notes: "" }]);
    setSelectedId(id);
  }
  function remove(id: string) {
    onChange(domains.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  }
  function moveDomain(from: number, to: number) {
    const next = [...domains];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  // Note page (free writing) for the selected domain
  if (selected) {
    return (
      <section className="mt-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedId(null)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-line/5 hover:text-ink"
            aria-label="Retour aux domaines"
            title="Retour"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <input
            value={selected.title}
            onChange={(e) => update(selected.id, { title: e.target.value })}
            className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-ink outline-none focus:text-accent-soft"
          />
          <button
            onClick={() => remove(selected.id)}
            className="shrink-0 text-[12px] text-muted transition-colors hover:text-accent-rose"
          >
            supprimer
          </button>
        </div>

        <textarea
          value={selected.notes}
          onChange={(e) => update(selected.id, { notes: e.target.value })}
          placeholder="Écris librement… (idées, notes, liens, synthèses)"
          className="glass mt-4 min-h-[60vh] w-full resize-y rounded-2xl p-5 text-[14px] leading-relaxed text-ink/90 outline-none placeholder:text-muted/50 focus:border-line/20"
          style={{ borderColor: `${accent}22` }}
        />
      </section>
    );
  }

  // Domains grid
  return (
    <section className="mt-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Domaines de connaissance
        </h2>
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-lg border border-line/10 px-3 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-line/25 hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouveau domaine
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((d, i) => {
          const preview = d.notes.trim().replace(/\s+/g, " ").slice(0, 110);
          return (
            <button
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) {
                  moveDomain(dragIndex, i);
                  setDragIndex(i);
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group/dom glass glass-hover relative cursor-grab select-none overflow-hidden rounded-xl p-4 text-left transition-opacity active:cursor-grabbing ${
                dragIndex === i ? "opacity-40" : ""
              }`}
            >
              <span
                className="absolute left-0 top-0 h-full w-[3px]"
                style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
              />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `${accent}1a`, border: `1px solid ${accent}44`, color: accent }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2z" />
                      <path d="M5 4v16" />
                    </svg>
                  </span>
                  <span className="text-[15px] font-semibold text-ink">{d.title}</span>
                </div>
                <span
                  className="shrink-0 text-muted opacity-40 transition-opacity group-hover/dom:opacity-80"
                  title="Glisser pour réordonner"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-muted">
                {preview || "Domaine vide — clique pour écrire."}
              </p>
            </button>
          );
        })}

        {domains.length === 0 && (
          <div className="glass col-span-full rounded-xl p-8 text-center text-sm text-muted">
            Aucun domaine. Crée ton premier domaine de connaissance.
          </div>
        )}
      </div>
    </section>
  );
}
