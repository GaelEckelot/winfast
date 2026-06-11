"use client";

import { useState } from "react";
import type { Kpi } from "@/lib/types";
import { trendFromDelta } from "@/lib/store";

function formatValue(v: number, unit: string): string {
  let s: string;
  if (Math.abs(v) >= 1000) s = v.toLocaleString("fr-FR");
  else if (Number.isInteger(v)) s = String(v);
  else s = v.toFixed(1).replace(".", ",");
  return unit === "€" ? `${s} €` : unit ? `${s} ${unit}` : s;
}

const trendIcon: Record<Kpi["trend"], string> = {
  up: "M3 17l6-6 4 4 7-7",
  down: "M3 7l6 6 4-4 7 7",
  flat: "M3 12h18",
};

interface Props {
  kpi: Kpi;
  accent: string;
  onChange: (k: Kpi) => void;
  onDelete: () => void;
}

export function KpiCard({ kpi, accent, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const pct = kpi.target > 0 ? Math.min(100, Math.round((kpi.value / kpi.target) * 100)) : 0;
  const positive = kpi.delta > 0;
  const negative = kpi.delta < 0;

  function setNum(field: "value" | "target" | "delta", raw: string) {
    const n = raw === "" || raw === "-" ? 0 : Number(raw.replace(",", "."));
    if (Number.isNaN(n)) return;
    const patch: Kpi = { ...kpi, [field]: n };
    if (field === "delta") patch.trend = trendFromDelta(n);
    onChange(patch);
  }

  return (
    <div className="glass glass-hover group/kpi relative rounded-xl p-3 animate-fade-up">
      <button
        onClick={() => setEditing((e) => !e)}
        className="absolute right-2.5 top-2.5 text-muted opacity-0 transition-opacity hover:text-ink group-hover/kpi:opacity-100"
        title={editing ? "Fermer l'édition" : "Éditer ce KPI"}
        aria-label="Éditer"
      >
        {editing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        )}
      </button>

      <div className="flex items-start justify-between gap-2 pr-5">
        {editing ? (
          <input
            value={kpi.label}
            onChange={(e) => onChange({ ...kpi, label: e.target.value })}
            className="w-full bg-transparent text-xs uppercase tracking-wider text-ink outline-none focus:text-accent-soft"
          />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-muted">{kpi.label}</span>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2.5">
          <Field label="Valeur">
            <input
              inputMode="decimal"
              value={kpi.value}
              onChange={(e) => setNum("value", e.target.value)}
              className="kpi-edit"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Objectif">
              <input
                inputMode="decimal"
                value={kpi.target}
                onChange={(e) => setNum("target", e.target.value)}
                className="kpi-edit"
              />
            </Field>
            <Field label="Unité">
              <input
                value={kpi.unit}
                placeholder="€, h, %…"
                onChange={(e) => onChange({ ...kpi, unit: e.target.value })}
                className="kpi-edit"
              />
            </Field>
          </div>
          <Field label="Variation (%)">
            <input
              inputMode="decimal"
              value={kpi.delta}
              onChange={(e) => setNum("delta", e.target.value)}
              className="kpi-edit"
            />
          </Field>
          <button
            onClick={onDelete}
            className="w-full rounded-md border border-line/10 py-1.5 text-[11px] text-muted transition-colors hover:border-accent-rose/50 hover:text-accent-rose"
          >
            Supprimer ce KPI
          </button>
        </div>
      ) : (
        <>
          <div className="mt-1 flex items-end justify-between gap-1">
            <span
              className="whitespace-nowrap font-mono text-lg font-semibold tracking-tight"
              style={{ color: accent }}
            >
              {formatValue(kpi.value, kpi.unit)}
            </span>
            <span
              className="flex shrink-0 items-center gap-1 pb-0.5 text-[11px] font-mono"
              style={{ color: positive ? "#22a06b" : negative ? "#d35468" : "#6b7385" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={trendIcon[kpi.trend]} />
              </svg>
              {kpi.delta > 0 ? "+" : ""}
              {kpi.delta}%
            </span>
          </div>

          <div className="mt-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-line/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-mono text-muted">
              <span>{pct}% de l&apos;objectif</span>
              <span>cible {formatValue(kpi.target, kpi.unit)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}
