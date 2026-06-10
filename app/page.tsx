"use client";

import { useState } from "react";
import { DOMAINS } from "@/lib/domains";
import type { DomainId } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Dashboard } from "@/components/Dashboard";
import { Assistant } from "@/components/Assistant";

export default function Home() {
  const { data, hydrated, update, reset } = useStore();
  const [active, setActive] = useState<DomainId>("sante");
  const [assistantOpen, setAssistantOpen] = useState(true);

  const domain = DOMAINS.find((d) => d.id === active)!;
  const state = data[active];

  return (
    <div className="grid-overlay flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 flex-col border-r border-white/5 bg-bg-panel/40 px-4 py-6 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {DOMAINS.map((d) => {
            const isActive = d.id === active;
            return (
              <button
                key={d.id}
                onClick={() => setActive(d.id)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive ? "bg-white/[0.06] text-white" : "text-muted hover:bg-white/[0.03] hover:text-white/90"
                }`}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={
                    isActive
                      ? { background: `${d.accent}1f`, color: d.accent, border: `1px solid ${d.accent}44` }
                      : { color: "inherit", border: "1px solid transparent" }
                  }
                >
                  <Icon paths={d.icon} size={18} />
                </span>
                <span className="flex-1 text-left font-medium">{d.label}</span>
                {d.ai && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted group-hover:text-white/60">
                    AI
                  </span>
                )}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.accent }} />
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            if (confirm("Réinitialiser toutes les données aux valeurs par défaut ?")) reset();
          }}
          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:text-accent-rose"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Réinitialiser les données
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <div className="sticky top-0 z-20 border-b border-white/5 bg-bg-base/80 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Brand compact />
            <button
              onClick={() => setAssistantOpen((o) => !o)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/80"
              style={{ borderColor: `${domain.accent}55`, color: domain.accent }}
            >
              {assistantOpen ? "Masquer l'IA" : "Copilote IA"}
            </button>
          </div>
          <div className="flex gap-1 overflow-x-auto px-3 pb-3">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                  d.id === active ? "bg-white/10 text-white" : "text-muted"
                }`}
              >
                <span style={{ color: d.id === active ? d.accent : "inherit" }}>
                  <Icon paths={d.icon} size={14} />
                </span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Dashboard */}
          <main className="min-w-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 lg:py-9">
            <div className="mx-auto max-w-5xl">
              {hydrated ? (
                <Dashboard
                  domain={domain}
                  state={state}
                  onChange={(updater) => update(active, updater)}
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-muted">
                  Initialisation d&apos;UPPER LIFE…
                </div>
              )}
            </div>
          </main>

          {/* Assistant (desktop) */}
          <aside
            className={`hidden h-[calc(100vh)] w-[370px] shrink-0 border-l border-white/5 bg-bg-panel/40 backdrop-blur-xl ${
              assistantOpen ? "xl:block" : ""
            }`}
          >
            <div className="sticky top-0 h-screen">
              <Assistant domain={domain} state={state} />
            </div>
          </aside>
        </div>

        {/* Assistant (mobile drawer) */}
        {assistantOpen && (
          <div className="fixed inset-x-0 bottom-0 z-30 h-[70vh] border-t border-white/10 bg-bg-panel/95 backdrop-blur-xl xl:hidden">
            <Assistant domain={domain} state={state} />
          </div>
        )}
      </div>

      {/* Desktop assistant toggle (when hidden) */}
      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 z-30 hidden h-12 w-12 items-center justify-center rounded-full shadow-glow xl:flex"
          style={{ background: domain.accent, color: "#07080c" }}
          aria-label="Ouvrir le copilote"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={compact ? 30 : 34} />
      {!compact ? (
        <div>
          <div className="text-sm font-bold tracking-[0.22em] text-white">UPPER LIFE</div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-muted">Augmented OS</div>
        </div>
      ) : (
        <div className="text-sm font-bold tracking-[0.22em] text-white">UPPER LIFE</div>
      )}
    </div>
  );
}
