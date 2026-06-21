"use client";

import { useMemo } from "react";
import type { HabitTracker as HabitTrackerData } from "@/lib/types";
import { isoDate, newId, todayISO } from "@/lib/store";

interface Props {
  data: HabitTrackerData;
  accent: string;
  onChange: (next: HabitTrackerData) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// Heatmap color codes (gem palette): red → yellow → green by completion ratio.
const COLORS = {
  red: "#c21f3a",
  yellow: "#c9921f",
  green: "#0f8b58",
};

type CellKind = "empty" | "future" | "red" | "yellow" | "green";

/** Habit tracker — daily checklist + GitHub-style monthly heatmap. */
export function HabitTracker({ data, accent, onChange }: Props) {
  const today = todayISO();
  const habits = data.habits;
  const total = habits.length;

  const habitIds = useMemo(() => new Set(habits.map((h) => h.id)), [habits]);

  /** Number of *existing* habits completed on a given ISO date. */
  function doneCount(date: string): number {
    const entry = data.log[date];
    if (!entry) return 0;
    return entry.filter((id) => habitIds.has(id)).length;
  }

  function toggleToday(habitId: string) {
    const entry = data.log[today] ?? [];
    const next = entry.includes(habitId)
      ? entry.filter((id) => id !== habitId)
      : [...entry, habitId];
    onChange({ ...data, log: { ...data.log, [today]: next } });
  }

  function addHabit() {
    onChange({
      ...data,
      habits: [...habits, { id: newId(), label: "" }],
    });
  }

  function updateLabel(id: string, label: string) {
    onChange({
      ...data,
      habits: habits.map((h) => (h.id === id ? { ...h, label } : h)),
    });
  }

  function removeHabit(id: string) {
    onChange({
      ...data,
      habits: habits.filter((h) => h.id !== id),
    });
  }

  const todayEntry = data.log[today] ?? [];
  const todayDone = todayEntry.filter((id) => habitIds.has(id)).length;

  // Build the current month grid (weeks as columns, weekdays as rows).
  const { weeks, monthLabel } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    // Monday-based weekday of the 1st (0 = Mon … 6 = Sun).
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;

    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const w: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) w.push(cells.slice(i, i + 7));
    return { weeks: w, monthLabel: `${MONTHS[m]} ${y}`, y, m };
  }, []);

  function cellInfo(day: number | null): { kind: CellKind; ratio: number; iso: string } {
    if (day == null) return { kind: "empty", ratio: 0, iso: "" };
    const now = new Date();
    const date = isoDate(new Date(now.getFullYear(), now.getMonth(), day));
    if (date > today) return { kind: "future", ratio: 0, iso: date };
    const entry = data.log[date];
    if (!entry) return { kind: "empty", ratio: 0, iso: date };
    const ratio = total ? doneCount(date) / total : 0;
    const kind: CellKind = ratio >= 0.7 ? "green" : ratio >= 0.4 ? "yellow" : "red";
    return { kind, ratio, iso: date };
  }

  function cellStyle(kind: CellKind, ratio: number): React.CSSProperties {
    if (kind === "green") return { background: COLORS.green, opacity: 0.55 + ratio * 0.45 };
    if (kind === "yellow") return { background: COLORS.yellow };
    if (kind === "red") return { background: COLORS.red };
    return {}; // empty / future → handled by className
  }

  return (
    <section className="mt-7">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Tracker d&apos;habitudes
        </h2>
        <span className="font-mono text-xs text-muted">
          Aujourd&apos;hui&nbsp;
          <span style={{ color: accent }}>
            {todayDone}/{total}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Today's checklist */}
        <div className="glass rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-ink">Mes habitudes du jour</span>
            <button
              onClick={addHabit}
              className="flex items-center gap-1 rounded-lg border border-line/10 px-2 py-1 text-xs text-ink/80 transition-colors hover:border-line/25 hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Ajouter
            </button>
          </div>

          {habits.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">
              Aucune habitude. Ajoute ta première habitude à suivre.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {habits.map((h) => {
                const checked = todayEntry.includes(h.id);
                return (
                  <li key={h.id} className="group flex items-center gap-2.5">
                    <button
                      onClick={() => toggleToday(h.id)}
                      aria-label={checked ? "Décocher" : "Cocher"}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
                      style={{
                        borderColor: checked ? accent : "var(--line)",
                        background: checked ? accent : "transparent",
                      }}
                    >
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                    <input
                      value={h.label}
                      onChange={(e) => updateLabel(h.id, e.target.value)}
                      placeholder="Nouvelle habitude"
                      className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60 ${
                        checked ? "text-muted line-through" : "text-ink"
                      }`}
                    />
                    <button
                      onClick={() => removeHabit(h.id)}
                      aria-label="Supprimer l'habitude"
                      className="shrink-0 text-muted/50 opacity-0 transition-opacity hover:text-ink group-hover:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Monthly heatmap */}
        <div className="glass rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-ink">{monthLabel}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <span>Moins</span>
              <span className="h-3 w-3 rounded-[3px] bg-line/15" />
              <span className="h-3 w-3 rounded-[3px]" style={{ background: COLORS.red }} />
              <span className="h-3 w-3 rounded-[3px]" style={{ background: COLORS.yellow }} />
              <span className="h-3 w-3 rounded-[3px]" style={{ background: COLORS.green }} />
              <span>Plus</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {/* Weekday labels */}
            <div className="flex flex-col gap-1 pt-0.5">
              {WEEKDAYS.map((w, i) => (
                <span
                  key={w}
                  className="h-4 text-[9px] leading-4 text-muted"
                  style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
                >
                  {w}
                </span>
              ))}
            </div>

            {/* Weeks (columns) */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  const { kind, ratio, iso } = cellInfo(day);
                  const isToday = iso === today;
                  const isEmptyish = kind === "empty" || kind === "future";
                  return (
                    <div
                      key={di}
                      title={
                        day == null
                          ? ""
                          : `${iso} — ${doneCount(iso)}/${total} habitude${total > 1 ? "s" : ""}`
                      }
                      className={`h-4 w-4 rounded-[3px] ${
                        day == null
                          ? "opacity-0"
                          : isEmptyish
                            ? "bg-line/15"
                            : ""
                      }`}
                      style={{
                        ...(isEmptyish ? {} : cellStyle(kind, ratio)),
                        ...(isToday
                          ? { outline: `1.5px solid ${accent}`, outlineOffset: "1px" }
                          : {}),
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            Chaque case = un jour. Sa couleur reflète la part d&apos;habitudes faites&nbsp;:
            <span style={{ color: COLORS.red }}> &lt;40 %</span>,
            <span style={{ color: COLORS.yellow }}> 40–69 %</span>,
            <span style={{ color: COLORS.green }}> ≥70 %</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
