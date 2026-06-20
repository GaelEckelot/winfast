"use client";

import { useState } from "react";
import type { Sop } from "@/lib/types";
import { newId } from "@/lib/store";

/** Business module body: SOP list (left) + projects (right), 50/50.
 *  Opening a SOP takes over the whole body (like the Knowledge view). */
export function BusinessBody({
  sops,
  accent,
  onChange,
  projectList,
}: {
  sops: Sop[];
  accent: string;
  onChange: (next: Sop[]) => void;
  projectList: React.ReactNode;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [autoFocusTitle, setAutoFocusTitle] = useState(false);
  const open = sops.find((s) => s.id === openId) ?? null;

  if (open) {
    return (
      <SopPage
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

  return (
    <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      <SopList
        sops={sops}
        accent={accent}
        onOpen={(id) => {
          setAutoFocusTitle(false);
          setOpenId(id);
        }}
        onCreate={(id) => {
          setAutoFocusTitle(true);
          setOpenId(id);
        }}
        onChange={onChange}
      />
      <div className="lg:col-span-2">{projectList}</div>
    </div>
  );
}

/** Left card: list of SOPs, openable, deletable (same menu pattern as the home todo). */
function SopList({
  sops,
  accent,
  onOpen,
  onCreate,
  onChange,
}: {
  sops: Sop[];
  accent: string;
  onOpen: (id: string) => void;
  onCreate: (id: string) => void;
  onChange: (next: Sop[]) => void;
}) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  function add() {
    const id = newId();
    onChange([...sops, { id, title: "Nouveau SOP", steps: [] }]);
    onCreate(id);
  }
  function remove(id: string) {
    onChange(sops.filter((s) => s.id !== id));
    setMenuOpen(null);
  }

  return (
    <div className="glass relative rounded-2xl">
      {menuOpen && (
        <button
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setMenuOpen(null)}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <div className="flex items-center justify-between border-b border-line/5 px-4 py-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">S.O.P</h2>
        <span className="font-mono text-[11px] text-muted">{sops.length}</span>
      </div>

      <div className="divide-y divide-line/[0.04]">
        {sops.map((s) => {
          const done = s.steps.filter((x) => x.done).length;
          return (
            <div key={s.id} className="group flex items-center gap-2 px-3 py-2.5">
              <button
                onClick={() => onOpen(s.id)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${accent}1a`, border: `1px solid ${accent}44`, color: accent }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink">{s.title}</span>
                  <span className="block text-[11px] text-muted">
                    {s.steps.length === 0 ? "Aucune étape" : `${done}/${s.steps.length} étapes`}
                  </span>
                </span>
              </button>

              <div className="relative w-7 shrink-0">
                <button
                  onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted opacity-0 transition-opacity hover:bg-line/5 hover:text-ink group-hover:opacity-100"
                  aria-label="Options"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.6" />
                    <circle cx="12" cy="12" r="1.6" />
                    <circle cx="19" cy="12" r="1.6" />
                  </svg>
                </button>
                {menuOpen === s.id && (
                  <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-lg border border-line/10 bg-elevated shadow-xl">
                    <button
                      onClick={() => remove(s.id)}
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

        {sops.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted">
            Aucun SOP. Crée ta première procédure.
          </div>
        )}
      </div>

      <div className="border-t border-line/5 px-4 py-2.5">
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted transition-colors hover:text-ink"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md border border-line/15">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          Nouveau SOP
        </button>
      </div>
    </div>
  );
}

/** Full-body procedure page: numbered, checkable, editable steps. */
function SopPage({
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
    <section className="mt-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-line/5 hover:text-ink"
          aria-label="Retour aux SOP"
          title="Retour"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">S.O.P</span>
        <input
          autoFocus={autoFocusTitle}
          value={sop.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-ink outline-none focus:text-accent-soft"
        />
      </div>

      <div className="glass mt-4 rounded-2xl p-2">
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
    </section>
  );
}
