"use client";

import { useMemo, useState } from "react";
import { DOMAINS, HOME_DOMAIN } from "@/lib/domains";
import type { DomainId } from "@/lib/types";
import { domainHealth, globalState, useStore } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Dashboard } from "@/components/Dashboard";
import { Assistant } from "@/components/Assistant";
import { Home as HomeView } from "@/components/Home";

type View = DomainId | "home";

export default function Page() {
  const { data, todos, hydrated, update, addTodo, updateTodo, removeTodo, reset } = useStore();
  const [active, setActive] = useState<View>("home");
  const [assistantOpen, setAssistantOpen] = useState(false);

  const isHome = active === "home";
  const domain = isHome ? HOME_DOMAIN : DOMAINS.find((d) => d.id === active)!;

  const labels = useMemo(() => Object.fromEntries(DOMAINS.map((d) => [d.id, d.label])), []);
  const assistantState = isHome ? globalState(data, labels) : data[active as DomainId];

  return (
    <div className="grid-overlay flex min-h-screen flex-col">
      {/* Top navigation band */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-bg-base/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <button onClick={() => setActive("home")} className="shrink-0" aria-label="Accueil">
            <Brand />
          </button>

          <div className="mx-1 hidden h-7 w-px bg-white/8 sm:block" />

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {DOMAINS.map((d) => {
              const a = d.id === active;
              const health = domainHealth(data[d.id]);
              return (
                <button
                  key={d.id}
                  onClick={() => setActive(d.id)}
                  className={`group flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                    a ? "bg-white/[0.06] text-white" : "text-muted hover:bg-white/[0.03] hover:text-white/90"
                  }`}
                  style={a ? { boxShadow: `inset 0 -2px 0 ${d.accent}` } : undefined}
                >
                  <span style={{ color: a ? d.accent : `${d.accent}aa` }}>
                    <Icon paths={d.icon} size={15} />
                  </span>
                  <span className="font-medium">{d.label}</span>
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: a ? d.accent : "#5b6377" }}
                  >
                    {health}%
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => {
                if (confirm("Réinitialiser toutes les données aux valeurs par défaut ?")) reset();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-accent-rose"
              title="Réinitialiser les données"
              aria-label="Réinitialiser"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <button
              onClick={() => setAssistantOpen((o) => !o)}
              className="hidden h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs sm:flex"
              style={{ borderColor: `${domain.accent}44`, color: domain.accent }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {assistantOpen ? "Masquer" : "Copilote"}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 lg:py-9">
          <div className="mx-auto max-w-5xl">
            {!hydrated ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted">
                Initialisation d&apos;UPPER LIFE…
              </div>
            ) : isHome ? (
              <HomeView todos={todos} onAdd={addTodo} onUpdate={updateTodo} onRemove={removeTodo} />
            ) : (
              <Dashboard
                domain={domain}
                state={data[active as DomainId]}
                onChange={(updater) => update(active as DomainId, updater)}
              />
            )}
          </div>
        </main>

        {/* Assistant (desktop) */}
        <aside
          className={`hidden w-[370px] shrink-0 border-l border-white/5 bg-bg-panel/40 backdrop-blur-xl ${
            assistantOpen ? "xl:block" : ""
          }`}
        >
          <div className="sticky top-[57px] h-[calc(100vh-57px)]">
            <Assistant
              domain={domain}
              state={assistantState}
              onClose={() => setAssistantOpen(false)}
            />
          </div>
        </aside>
      </div>

      {/* Assistant (mobile drawer) */}
      {assistantOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 h-[70vh] border-t border-white/10 bg-bg-panel/95 backdrop-blur-xl xl:hidden">
          <Assistant
            domain={domain}
            state={assistantState}
            onClose={() => setAssistantOpen(false)}
          />
        </div>
      )}

      {/* Mobile assistant toggle */}
      <button
        onClick={() => setAssistantOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-glow sm:hidden"
        style={{ background: domain.accent, color: "#04060b" }}
        aria-label="Copilote"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Desktop reopen tab (when copilot hidden) */}
      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="group fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-l-xl border border-r-0 border-white/10 bg-bg-panel/85 px-2.5 py-3 backdrop-blur-xl transition-colors hover:border-white/20 xl:flex"
          style={{ color: domain.accent }}
          aria-label="Afficher le copilote"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted [writing-mode:vertical-rl] group-hover:text-white/70">
            Copilote
          </span>
        </button>
      )}
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={32} />
      <div className="hidden sm:block">
        <div className="text-sm font-bold tracking-[0.2em] text-white">UPPER LIFE</div>
        <div className="text-[9px] uppercase tracking-[0.22em] text-muted">Augmented OS</div>
      </div>
    </div>
  );
}
