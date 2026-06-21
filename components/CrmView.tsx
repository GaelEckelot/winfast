"use client";

import { useMemo, useState } from "react";
import type { Client, CrmStage } from "@/lib/types";
import { emptyClient } from "@/lib/store";

interface Props {
  clients: Client[];
  accent: string;
  onChange: (next: Client[]) => void;
}

const STAGES: { id: CrmStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "#7c8499" },
  { id: "contacted", label: "Contacté", color: "#1f63c9" },
  { id: "proposal", label: "Proposition", color: "#c9921f" },
  { id: "won", label: "Gagné", color: "#0f8b58" },
  { id: "lost", label: "Perdu", color: "#c21f3a" },
];

const STAGE_COLOR: Record<CrmStage, string> = Object.fromEntries(
  STAGES.map((s) => [s.id, s.color]),
) as Record<CrmStage, string>;

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Business CRM — Kanban pipeline of clients/deals across stages. */
export function CrmView({ clients, accent, onChange }: Props) {
  const summary = useMemo(() => {
    const open = clients.filter(
      (c) => c.stage === "lead" || c.stage === "contacted" || c.stage === "proposal",
    );
    const pipeline = open.reduce((a, c) => a + (c.value || 0), 0);
    const won = clients.filter((c) => c.stage === "won").reduce((a, c) => a + (c.value || 0), 0);
    return { count: clients.length, pipeline, won };
  }, [clients]);

  function update(id: string, patch: Partial<Client>) {
    onChange(clients.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function remove(id: string) {
    onChange(clients.filter((c) => c.id !== id));
  }
  function add(stage: CrmStage) {
    onChange([...clients, emptyClient(stage)]);
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">CRM</h2>
        <div className="flex items-center gap-5 font-mono text-xs">
          <Stat label="Clients" value={String(summary.count)} accent={accent} />
          <Stat label="Pipeline" value={eur.format(summary.pipeline)} accent={accent} />
          <Stat label="Gagné" value={eur.format(summary.won)} accent="#0f8b58" />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {STAGES.map((stage) => {
          const col = clients.filter((c) => c.stage === stage.id);
          const sum = col.reduce((a, c) => a + (c.value || 0), 0);
          return (
            <div key={stage.id} className="flex w-[230px] shrink-0 flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                  <span className="text-[13px] font-medium text-ink">{stage.label}</span>
                  <span className="font-mono text-[11px] text-muted">{col.length}</span>
                </div>
                <span className="font-mono text-[10px] text-muted">{eur.format(sum)}</span>
              </div>

              <div className="flex flex-col gap-2">
                {col.map((c) => (
                  <ClientCard
                    key={c.id}
                    client={c}
                    accent={accent}
                    onChange={(patch) => update(c.id, patch)}
                    onRemove={() => remove(c.id)}
                  />
                ))}

                <button
                  onClick={() => add(stage.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-line/15 py-2 text-[12px] text-muted transition-colors hover:border-line/30 hover:text-ink"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Client
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted">{label}</span>
      <span style={{ color: accent }}>{value}</span>
    </span>
  );
}

function ClientCard({
  client,
  accent,
  onChange,
  onRemove,
}: {
  client: Client;
  accent: string;
  onChange: (patch: Partial<Client>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass group rounded-xl p-2.5">
      <div className="flex items-start gap-1.5">
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full"
          style={{ background: STAGE_COLOR[client.stage] }}
        />
        <input
          value={client.company}
          onChange={(e) => onChange({ company: e.target.value })}
          placeholder="Société"
          className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-ink outline-none placeholder:text-muted/50"
        />
        <button
          onClick={onRemove}
          aria-label="Supprimer le client"
          className="shrink-0 text-muted/50 opacity-0 transition-opacity hover:text-accent-rose group-hover:opacity-100"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        value={client.contact}
        onChange={(e) => onChange({ contact: e.target.value })}
        placeholder="Contact"
        className="mt-0.5 w-full bg-transparent pl-3.5 text-[12px] text-muted outline-none placeholder:text-muted/40"
      />

      <div className="mt-1.5 flex items-center gap-2 pl-3.5">
        <div className="flex items-center gap-0.5 font-mono text-[13px]" style={{ color: accent }}>
          <input
            type="number"
            value={client.value || ""}
            onChange={(e) => onChange({ value: Number(e.target.value) || 0 })}
            placeholder="0"
            className="w-16 bg-transparent text-right outline-none placeholder:text-muted/40"
          />
          <span>€</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-[11px] text-muted transition-colors hover:text-ink"
        >
          {open ? "Réduire" : "Détails"}
        </button>
      </div>

      {open && (
        <div className="mt-2 flex flex-col gap-2 border-t border-line/[0.06] pt-2 pl-3.5">
          <label className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted">Étape</span>
            <select
              value={client.stage}
              onChange={(e) => onChange({ stage: e.target.value as CrmStage })}
              className="rounded-md border border-line/10 bg-elevated px-1.5 py-1 text-[12px] text-ink outline-none"
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <input
            value={client.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="Email"
            className="w-full bg-transparent text-[12px] text-ink/90 outline-none placeholder:text-muted/40"
          />
          <input
            value={client.nextAction}
            onChange={(e) => onChange({ nextAction: e.target.value })}
            placeholder="Prochaine action…"
            className="w-full bg-transparent text-[12px] text-ink/90 outline-none placeholder:text-muted/40"
          />
          <textarea
            value={client.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Notes…"
            rows={2}
            className="w-full resize-none bg-transparent text-[12px] text-muted outline-none placeholder:text-muted/40"
          />
        </div>
      )}

      {!open && client.nextAction && (
        <p className="mt-1 truncate pl-3.5 text-[11px] text-muted/80" title={client.nextAction}>
          → {client.nextAction}
        </p>
      )}
    </div>
  );
}
