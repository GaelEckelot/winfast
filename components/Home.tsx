"use client";

import type { TodoItem } from "@/lib/types";
import { DailyTodo } from "./DailyTodo";

interface Props {
  todos: TodoItem[];
  name: string;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<TodoItem>) => void;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
}

export function Home({ todos, name, onAdd, onUpdate, onRemove, onMove }: Props) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hour = now.getHours();
  const greeting =
    hour < 6 ? "Bonne nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bel après-midi" : "Bonsoir";

  const top1 = todos.filter((t) => t.priority === "top1" && !t.done).length;

  return (
    <div className="flex min-h-[78vh] animate-fade-up flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
            {dateStr}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {greeting}
            {name ? <>, {name}</> : null}.
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Actions du jour — {todos.filter((t) => !t.done).length} à faire
            {top1 > 0 && (
              <>
                {" · "}
                <span style={{ color: "#d83a52" }}>{top1} en Top&nbsp;1</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-7">
          <DailyTodo todos={todos} onAdd={onAdd} onUpdate={onUpdate} onRemove={onRemove} onMove={onMove} />
        </div>
      </div>
    </div>
  );
}
