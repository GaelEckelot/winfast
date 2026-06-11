"use client";

import { useState } from "react";
import type { Priority, TodoItem } from "@/lib/types";

const PRIO: Record<Priority, { label: string; dot: string; bg: string; text: string }> = {
  top1: { label: "Top 1", dot: "#d8546b", bg: "#741a2c", text: "#f1c6cd" },
  top2: { label: "Top 2", dot: "#d6a63d", bg: "#735417", text: "#f0debb" },
  top3: { label: "Top 3", dot: "#2fa676", bg: "#0b5036", text: "#bce8d2" },
};
const PRIO_ORDER: Priority[] = ["top1", "top2", "top3"];

interface Props {
  todos: TodoItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<TodoItem>) => void;
  onRemove: (id: string) => void;
}

export function DailyTodo({ todos, onAdd, onUpdate, onRemove }: Props) {
  const [prioOpen, setPrioOpen] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const closeAll = () => {
    setPrioOpen(null);
    setMenuOpen(null);
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="glass relative rounded-2xl">
      {/* click-away layer */}
      {(prioOpen || menuOpen) && (
        <button
          className="fixed inset-0 z-10 cursor-default"
          onClick={closeAll}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      {/* title */}
      <div className="flex items-center justify-between border-b border-line/5 px-4 py-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">Todo du jour</h2>
        <span className="font-mono text-[11px] text-muted">
          {doneCount}/{todos.length}
        </span>
      </div>

      {/* column header */}
      <div className="flex items-center justify-between border-b border-line/5 px-4 py-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          <span className="w-7" />
          <span>Tâche</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-[68px] text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Prio
          </span>
          <span className="w-7" />
        </div>
      </div>

      {/* rows */}
      <div className="divide-y divide-line/[0.04]">
        {todos.map((t) => {
          const p = PRIO[t.priority];
          return (
            <div key={t.id} className="group flex items-center gap-2 px-4 py-2.5">
              {/* checkbox */}
              <button
                onClick={() => onUpdate(t.id, { done: !t.done })}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
                style={{
                  borderColor: t.done ? p.bg : "#2a2f40",
                  background: t.done ? p.bg : "transparent",
                }}
                aria-label={t.done ? "Marquer non fait" : "Marquer fait"}
              >
                {t.done && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#04060b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* task label */}
              <input
                value={t.label}
                placeholder="Nouvelle action…"
                onChange={(e) => onUpdate(t.id, { label: e.target.value })}
                className={`flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted/60 ${
                  t.done ? "text-muted line-through" : "text-ink/90"
                }`}
              />

              {/* priority dropdown */}
              <div className="relative w-[68px] shrink-0">
                <button
                  onClick={() => {
                    setMenuOpen(null);
                    setPrioOpen(prioOpen === t.id ? null : t.id);
                  }}
                  className="flex w-full items-center justify-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] font-semibold"
                  style={{ color: p.text, background: p.bg }}
                >
                  {p.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {prioOpen === t.id && (
                  <div className="absolute left-full top-1/2 z-20 ml-2 w-24 -translate-y-1/2 overflow-hidden rounded-lg border border-line/10 bg-elevated shadow-xl">
                    {PRIO_ORDER.map((key) => {
                      const o = PRIO[key];
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            onUpdate(t.id, { priority: key });
                            setPrioOpen(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] font-medium hover:bg-line/5"
                          style={{ color: o.dot }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.bg }} />
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* row menu */}
              <div className="relative w-7 shrink-0">
                <button
                  onClick={() => {
                    setPrioOpen(null);
                    setMenuOpen(menuOpen === t.id ? null : t.id);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted opacity-0 transition-opacity hover:bg-line/5 hover:text-ink group-hover:opacity-100"
                  aria-label="Options"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="19" cy="12" r="1.6" />
                  </svg>
                </button>
                {menuOpen === t.id && (
                  <div className="absolute left-full top-1/2 z-20 ml-2 w-36 -translate-y-1/2 overflow-hidden rounded-lg border border-line/10 bg-elevated shadow-xl">
                    <button
                      onClick={() => {
                        onRemove(t.id);
                        setMenuOpen(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-accent-rose hover:bg-line/5"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 13h10l1-13" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {todos.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted">
            Aucune action. Ajoute ta première tâche du jour.
          </div>
        )}
      </div>

      {/* footer: add */}
      <div className="flex items-center justify-between border-t border-line/5 px-4 py-2.5">
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-line/15">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          Ajouter une action
        </button>
        <span className="font-mono text-[11px] text-muted">
          {doneCount}/{todos.length} fait{doneCount > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
