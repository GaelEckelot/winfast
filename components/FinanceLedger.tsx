"use client";

import { useEffect, useRef } from "react";
import type { LedgerColumn, LedgerRole, LedgerRow } from "@/lib/types";
import { newId } from "@/lib/store";

function euro(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

function parseAmount(raw: string): number | undefined {
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

interface Props {
  columns: LedgerColumn[];
  accent: string;
  onChange: (next: LedgerColumn[]) => void;
}

export function FinanceLedger({ columns, accent, onChange }: Props) {
  // Only autofocus rows added after the initial mount (via the "Ligne" button).
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  const colTotal = (c: LedgerColumn) => c.rows.reduce((a, r) => a + (r.amount ?? 0), 0);
  const totalByRole = (role: LedgerRole) =>
    columns.filter((c) => c.role === role).reduce((a, c) => a + colTotal(c), 0);

  const net = totalByRole("cashflow") + totalByRole("assets") - totalByRole("debts");
  const netColor = net >= 0 ? "#22a06b" : "#d83a52";
  const coutMois = totalByRole("expenses") / 12;

  function patchColumn(cid: string, fn: (c: LedgerColumn) => LedgerColumn) {
    onChange(columns.map((c) => (c.id === cid ? fn(c) : c)));
  }
  function updateRow(cid: string, rid: string, patch: Partial<LedgerRow>) {
    patchColumn(cid, (c) => ({
      ...c,
      rows: c.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)),
    }));
  }
  function addRow(cid: string) {
    patchColumn(cid, (c) => ({ ...c, rows: [...c.rows, { id: newId(), label: "" }] }));
  }
  function removeRow(cid: string, rid: string) {
    patchColumn(cid, (c) => ({ ...c, rows: c.rows.filter((r) => r.id !== rid) }));
  }
  function setTitle(cid: string, title: string) {
    patchColumn(cid, (c) => ({ ...c, title }));
  }

  return (
    <section className="mt-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Bilan financier
      </h2>

      {/* Summary */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Summary label="Patrimoine net" value={euro(net)} hint="Cashflow + Assets − Dettes" accent={netColor} strong />
        <Summary label="Coût de vie / mois" value={euro(coutMois)} hint="Dépenses /an ÷ 12" accent={accent} />
        <Summary label="Dettes" value={euro(totalByRole("debts"))} hint="À rembourser" accent={accent} />
      </div>

      {/* Columns — single row on wide screens, with variable widths per column */}
      <div className="ledger-grid mt-4">
        {columns.map((col) => {
          const notes = col.role === "notes";
          return (
            <div key={col.id} className="glass flex min-w-0 flex-col rounded-xl p-2.5">
              <input
                value={col.title}
                onChange={(e) => setTitle(col.id, e.target.value)}
                className="mb-2 w-full min-w-0 bg-transparent text-center text-[13px] font-semibold tracking-tight text-ink outline-none focus:text-accent-soft"
              />

              <div className={`flex-1 ${notes ? "space-y-0.5" : "divide-y divide-line/10"}`}>
                {col.rows.map((r) => (
                  <div
                    key={r.id}
                    className={`group/row flex gap-1.5 ${notes ? "items-start" : "items-center py-1"}`}
                  >
                    {notes ? (
                      <AutoTextarea
                        value={r.label}
                        onChange={(v) => updateRow(col.id, r.id, { label: v })}
                        autoFocus={mounted.current}
                      />
                    ) : (
                      <input
                        autoFocus={mounted.current}
                        value={r.label}
                        onChange={(e) => updateRow(col.id, r.id, { label: e.target.value })}
                        placeholder="Libellé"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-ink/90 outline-none placeholder:text-muted/50"
                      />
                    )}
                    {!notes && (
                      <div className="flex items-center gap-0.5">
                        <input
                          inputMode="decimal"
                          value={r.amount ?? ""}
                          onChange={(e) =>
                            updateRow(col.id, r.id, { amount: parseAmount(e.target.value) })
                          }
                          placeholder="—"
                          className="w-14 bg-transparent text-right font-mono text-[13px] text-ink outline-none placeholder:text-muted/40"
                        />
                        <span className="font-mono text-[12px] text-muted">€</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeRow(col.id, r.id)}
                      className="shrink-0 text-muted opacity-0 transition-opacity hover:text-accent-rose group-hover/row:opacity-100"
                      aria-label="Supprimer la ligne"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                ))}
                {col.rows.length === 0 && (
                  <p className="py-2 text-center text-[12px] text-muted">Aucune ligne.</p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line/5 pt-2">
                <button
                  onClick={() => addRow(col.id)}
                  className="flex items-center gap-1 text-[12px] text-muted transition-colors hover:text-ink"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Ligne
                </button>
                {!notes && (
                  <span className="font-mono text-[13px] font-semibold" style={{ color: accent }}>
                    {euro(colTotal(col))}
                  </span>
                )}
              </div>

              {col.role === "expenses" && (
                <div className="mt-1 text-right font-mono text-[11px] text-muted">
                  ≈ {euro(coutMois)} /mois
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AutoTextarea({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      autoFocus={autoFocus}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Note…"
      className="min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-[13px] leading-snug text-ink/90 outline-none placeholder:text-muted/50"
    />
  );
}

function Summary({
  label,
  value,
  hint,
  accent,
  strong,
}: {
  label: string;
  value: string;
  hint: string;
  accent: string;
  strong?: boolean;
}) {
  return (
    <div
      className="glass rounded-xl p-4"
      style={strong ? { borderColor: `${accent}40` } : undefined}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div
        className={`mt-1 whitespace-nowrap font-mono font-semibold ${strong ? "text-2xl" : "text-lg"}`}
        style={{ color: strong ? accent : undefined }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-muted">{hint}</div>
    </div>
  );
}
