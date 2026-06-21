"use client";

import { useState } from "react";
import type { Client, Sop } from "@/lib/types";
import { newId } from "@/lib/store";
import { CrmView } from "./CrmView";
import { Icon } from "./Icon";

export type BusinessView = "home" | "crm" | "sop" | "actions";

interface Props {
  view: BusinessView;
  setView: (v: BusinessView) => void;
  sops: Sop[];
  onSopsChange: (next: Sop[]) => void;
  clients: Client[];
  onClientsChange: (next: Client[]) => void;
  projectsCount: number;
  accent: string;
  projectList: React.ReactNode;
}

const ICONS = {
  actions: ["M13 2 3 14h7l-1 8 10-12h-7z"],
  crm: [
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    "M23 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  sop: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8",
  ],
};

export function BusinessSection({
  view,
  setView,
  sops,
  onSopsChange,
  clients,
  onClientsChange,
  projectsCount,
  accent,
  projectList,
}: Props) {
  if (view === "crm") {
    return (
      <SubPage title="CRM" subtitle="Pipeline clients & opportunités" onBack={() => setView("home")}>
        <CrmView clients={clients} accent={accent} onChange={onClientsChange} />
      </SubPage>
    );
  }
  if (view === "actions") {
    return (
      <SubPage title="Actions" subtitle="Projets & chantiers en cours" onBack={() => setView("home")}>
        {projectList}
      </SubPage>
    );
  }
  if (view === "sop") {
    return (
      <SubPage title="S.O.P" subtitle="Procédures & documents opérationnels" onBack={() => setView("home")}>
        <SopSection sops={sops} accent={accent} onChange={onSopsChange} />
      </SubPage>
    );
  }

  // Home: the "Exécution" menu.
  return (
    <section className="mt-8 animate-fade-up">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Exécution
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MenuTile
          icon={ICONS.actions}
          title="Actions"
          desc="Projets & chantiers en cours"
          count={`${projectsCount} projet${projectsCount > 1 ? "s" : ""}`}
          accent={accent}
          onClick={() => setView("actions")}
        />
        <MenuTile
          icon={ICONS.crm}
          title="CRM"
          desc="Clients, deals & pipeline"
          count={`${clients.length} client${clients.length > 1 ? "s" : ""}`}
          accent={accent}
          onClick={() => setView("crm")}
        />
        <MenuTile
          icon={ICONS.sop}
          title="S.O.P"
          desc="Procédures & documents"
          count={`${sops.length} procédure${sops.length > 1 ? "s" : ""}`}
          accent={accent}
          onClick={() => setView("sop")}
        />
      </div>
    </section>
  );
}

function MenuTile({
  icon,
  title,
  desc,
  count,
  accent,
  onClick,
}: {
  icon: string[];
  title: string;
  desc: string;
  count: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass glass-hover group flex flex-col items-start rounded-2xl p-5 text-left transition-transform hover:-translate-y-0.5"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: `${accent}1a`, border: `1px solid ${accent}44`, color: accent }}
      >
        <Icon paths={icon} size={22} />
      </span>
      <span className="mt-3 flex w-full items-center justify-between">
        <span className="text-[15px] font-semibold text-ink">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted transition-transform group-hover:translate-x-0.5"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
      <span className="mt-0.5 text-[12px] text-muted">{desc}</span>
      <span className="mt-3 font-mono text-[11px]" style={{ color: accent }}>
        {count}
      </span>
    </button>
  );
}

/** Generic sub-page wrapper with a back button + title. */
function SubPage({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 animate-fade-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Exécution
      </button>
      <div className="mt-2">
        <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
        <p className="text-[13px] text-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

/* ---------------------------------- SOP ---------------------------------- */

function SopSection({
  sops,
  accent,
  onChange,
}: {
  sops: Sop[];
  accent: string;
  onChange: (next: Sop[]) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [autoFocusTitle, setAutoFocusTitle] = useState(false);
  const open = sops.find((s) => s.id === openId) ?? null;

  if (open) {
    return (
      <SopDoc
        sop={open}
        accent={accent}
        autoFocusTitle={autoFocusTitle}
        onBack={() => setOpenId(null)}
        onChange={(patch) =>
          onChange(sops.map((s) => (s.id === open.id ? { ...s, ...patch } : s)))
        }
      />
    );
  }

  function add() {
    const id = newId();
    onChange([...sops, { id, title: "Nouvelle procédure", body: "", steps: [] }]);
    setAutoFocusTitle(true);
    setOpenId(id);
  }
  function remove(id: string) {
    onChange(sops.filter((s) => s.id !== id));
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sops.map((s) => {
        const done = s.steps.filter((x) => x.done).length;
        const preview = (s.body ?? "").trim();
        return (
          <div key={s.id} className="glass glass-hover group relative rounded-2xl p-4">
            <button
              onClick={() => {
                setAutoFocusTitle(false);
                setOpenId(s.id);
              }}
              className="block w-full text-left"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${accent}1a`, border: `1px solid ${accent}44`, color: accent }}
              >
                <Icon paths={ICONS.sop} size={17} />
              </span>
              <span className="mt-2.5 block truncate text-[14px] font-semibold text-ink">{s.title}</span>
              <span className="mt-1 block text-[12px] leading-snug text-muted line-clamp-2">
                {preview || "Document vide — clique pour rédiger la procédure."}
              </span>
              <span className="mt-2.5 block text-[11px] font-mono text-muted">
                {s.steps.length === 0 ? "Aucune étape" : `${done}/${s.steps.length} étapes`}
              </span>
            </button>
            <button
              onClick={() => remove(s.id)}
              aria-label="Supprimer la procédure"
              className="absolute right-3 top-3 text-muted/50 opacity-0 transition-opacity hover:text-accent-rose group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}

      <button
        onClick={add}
        className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line/15 text-[13px] text-muted transition-colors hover:border-line/30 hover:text-ink"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line/15">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        Nouvelle procédure
      </button>
    </div>
  );
}

/** Full SOP document: editable title + free-text body + optional checklist. */
function SopDoc({
  sop,
  accent,
  autoFocusTitle,
  onBack,
  onChange,
}: {
  sop: Sop;
  accent: string;
  autoFocusTitle?: boolean;
  onBack: () => void;
  onChange: (patch: Partial<Sop>) => void;
}) {
  const [draft, setDraft] = useState("");

  function setSteps(steps: Sop["steps"]) {
    onChange({ steps });
  }
  function toggle(id: string) {
    setSteps(sop.steps.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }
  function updateStep(id: string, label: string) {
    setSteps(sop.steps.map((s) => (s.id === id ? { ...s, label } : s)));
  }
  function removeStep(id: string) {
    setSteps(sop.steps.filter((s) => s.id !== id));
  }
  function addStep() {
    const label = draft.trim();
    if (!label) return;
    setSteps([...sop.steps, { id: newId(), label, done: false }]);
    setDraft("");
  }

  return (
    <div className="mt-4 animate-fade-up">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-line/5 hover:text-ink"
          aria-label="Retour aux procédures"
          title="Retour"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <input
          autoFocus={autoFocusTitle}
          value={sop.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-ink outline-none focus:text-accent-soft"
        />
      </div>

      {/* Free-text document body */}
      <div className="glass mt-4 rounded-2xl p-4">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Procédure
        </span>
        <textarea
          value={sop.body ?? ""}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Rédige la procédure comme un document : contexte, objectif, déroulé détaillé, points de vigilance…"
          className="min-h-[220px] w-full resize-y bg-transparent text-[14px] leading-relaxed text-ink/90 outline-none placeholder:text-muted/50"
        />
      </div>

      {/* Optional checklist */}
      <div className="glass mt-3 rounded-2xl p-2">
        <span className="block px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Checklist
        </span>
        <div className="divide-y divide-line/[0.04]">
          {sop.steps.map((s, i) => (
            <div key={s.id} className="group/step flex items-center gap-2.5 px-2 py-2">
              <span className="w-5 shrink-0 text-right font-mono text-[12px] text-muted">{i + 1}</span>
              <button
                onClick={() => toggle(s.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
                style={{ borderColor: s.done ? accent : "#2a2f40", background: s.done ? accent : "transparent" }}
                aria-label={s.done ? "Marquer non fait" : "Marquer fait"}
              >
                {s.done && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#04060b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <input
                value={s.label}
                onChange={(e) => updateStep(s.id, e.target.value)}
                placeholder="Décris l'étape…"
                className={`min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted/50 ${
                  s.done ? "text-muted line-through" : "text-ink/90"
                }`}
              />
              <button
                onClick={() => removeStep(s.id)}
                className="shrink-0 text-muted opacity-0 transition-opacity hover:text-accent-rose group-hover/step:opacity-100"
                aria-label="Supprimer l'étape"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addStep();
            }}
            className="flex items-center gap-2.5 px-2 py-2"
          >
            <span className="w-5 shrink-0 text-right font-mono text-[12px] text-muted">{sop.steps.length + 1}</span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-line/15 text-muted">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ajouter une étape…"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-ink/90 outline-none placeholder:text-muted/60"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
