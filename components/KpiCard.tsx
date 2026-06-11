"use client";

import { useState } from "react";
import type { Kpi, Measurement } from "@/lib/types";

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
  const [logging, setLogging] = useState(false);
  const [draft, setDraft] = useState("");

  const pct = kpi.target > 0 ? Math.min(100, Math.round((kpi.value / kpi.target) * 100)) : 0;
  const positive = kpi.delta > 0;
  const negative = kpi.delta < 0;
  const history = kpi.history ?? [];

  function setNum(field: "target", raw: string) {
    const n = raw === "" || raw === "-" ? 0 : Number(raw.replace(",", "."));
    if (Number.isNaN(n)) return;
    onChange({ ...kpi, [field]: n });
  }

  function logValue() {
    const v = draft === "" || draft === "-" ? NaN : Number(draft.replace(",", "."));
    if (Number.isNaN(v)) {
      setLogging(false);
      setDraft("");
      return;
    }
    const prev = kpi.value;
    const delta = prev ? Math.round(((v - prev) / prev) * 1000) / 10 : 0;
    const hist = [
      ...history,
      { t: new Date().toISOString().slice(0, 10), v },
    ].slice(-60);
    onChange({
      ...kpi,
      value: v,
      delta,
      trend: v > prev ? "up" : v < prev ? "down" : "flat",
      history: hist,
    });
    setDraft("");
    setLogging(false);
  }

  return (
    <div className="glass glass-hover group/kpi relative rounded-xl p-3 animate-fade-up">
      {/* toolbar */}
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        {!editing && (
          <button
            onClick={() => setLogging((l) => !l)}
            title="Saisir une mesure"
            aria-label="Saisir une mesure"
            style={{ color: logging ? accent : undefined }}
            className="text-muted transition-colors hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </button>
        )}
        <button
          onClick={() => {
            setEditing((e) => !e);
            setLogging(false);
          }}
          className="text-muted opacity-0 transition-opacity hover:text-ink group-hover/kpi:opacity-100"
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
      </div>

      <div className="pr-12">
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

          <Sparkline data={history} color={accent} id={kpi.id} />

          {logging ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                logValue();
              }}
              className="mt-2 flex items-center gap-1.5"
            >
              <input
                autoFocus
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => !draft && setLogging(false)}
                placeholder="Nouvelle valeur…"
                className="kpi-edit flex-1 py-1"
              />
              <button
                type="submit"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ background: accent, color: "#fff" }}
                aria-label="Enregistrer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </form>
          ) : (
            <div className="mt-1.5 flex justify-between text-[10px] font-mono text-muted">
              <span>{pct}% de l&apos;objectif</span>
              <span>cible {formatValue(kpi.target, kpi.unit)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Sparkline({ data, color, id }: { data: Measurement[]; color: string; id: string }) {
  if (data.length < 2) {
    return <div className="mt-2 h-8 rounded bg-line/[0.03]" />;
  }
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 100;
  const H = 32;
  const pad = 3;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = pad + (H - 2 * pad) * (1 - (v - min) / range);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = pts.join(" ");
  const gid = `spark-${id}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2 h-8 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${line} ${W},${H} 0,${H}`} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
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
