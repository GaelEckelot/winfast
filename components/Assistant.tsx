"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, DomainMeta, DomainState } from "@/lib/types";

function buildSnapshot(state: DomainState): string {
  const kpis = state.kpis
    .map((k) => `- ${k.label}: ${k.value}${k.unit} (cible ${k.target}${k.unit}, ${k.delta > 0 ? "+" : ""}${k.delta}%)`)
    .join("\n");
  const projects = state.projects
    .map(
      (p) =>
        `- ${p.name} [${p.status}] ${p.progress}% — ${p.tasks.filter((t) => t.done).length}/${p.tasks.length} tâches`,
    )
    .join("\n");
  return `KPIs:\n${kpis}\n\nProjets:\n${projects}`;
}

export function Assistant({
  domain,
  state,
  onClose,
}: {
  domain: DomainMeta;
  state: DomainState;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Detect whether the AI copilot is configured (server-side API key present).
  useEffect(() => {
    let active = true;
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => active && setAiEnabled(Boolean(d?.enabled)))
      .catch(() => active && setAiEnabled(false));
    return () => {
      active = false;
    };
  }, []);

  // Reset conversation when switching domains.
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [domain.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const suggestions = SUGGESTIONS[domain.id] ?? [];

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming || aiEnabled === false) return;

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: domain.assistantContext,
          snapshot: buildSnapshot(state),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erreur réseau." }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${err.error ?? "Erreur."}` };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "⚠️ Connexion interrompue." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  // Copilot not configured (no API key) — show a friendly "coming soon" panel.
  if (aiEnabled === false) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">Copilote {domain.label}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted">
              hors ligne · activation ultérieure
            </div>
          </div>
          {onClose && <CollapseBtn onClose={onClose} />}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: `${domain.accent}1a`, border: `1px solid ${domain.accent}40`, color: domain.accent }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4z" />
              <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-white">Copilote IA — bientôt disponible</div>
          <p className="max-w-[260px] text-[13px] leading-relaxed text-muted text-balance">
            L&apos;app fonctionne entièrement sans lui. Le copilote s&apos;activera plus tard,
            une fois une clé API ajoutée — aucune autre étape à prévoir.
          </p>
          <span className="mt-1 rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted">
            Gratuit · données 100% locales
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span
          className="relative flex h-2 w-2 items-center justify-center"
          title="Assistant connecté"
        >
          <span className="absolute h-2 w-2 animate-pulse-ring rounded-full" style={{ background: domain.accent }} />
          <span className="h-2 w-2 rounded-full" style={{ background: domain.accent }} />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Copilote {domain.label}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted">
            propulsé par Claude · contextualisé
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-[11px] text-muted hover:text-white"
          >
            effacer
          </button>
        )}
        {onClose && <CollapseBtn onClose={onClose} />}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted text-balance">
              Pose une question sur ton module <span className="text-white">{domain.label}</span>.
              L&apos;assistant connaît tes KPIs et projets en cours.
            </p>
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="glass glass-hover rounded-lg px-3 py-2 text-left text-[13px] text-white/85"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                m.role === "user"
                  ? "bg-white/10 text-white"
                  : "glass text-white/90"
              }`}
              style={
                m.role === "assistant"
                  ? { borderColor: `${domain.accent}33` }
                  : undefined
              }
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <Dot d={domain.accent} delay={0} />
                  <Dot d={domain.accent} delay={0.15} />
                  <Dot d={domain.accent} delay={0.3} />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 p-3">
        <div className="glass flex items-end gap-2 rounded-xl px-3 py-2">
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (taRef.current) {
                taRef.current.style.height = "auto";
                taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + "px";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={`Demander à ton copilote ${domain.label}…`}
            className="max-h-[120px] flex-1 resize-none bg-transparent py-1 text-[13.5px] text-white placeholder:text-muted/70 outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={streaming || !input.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity disabled:opacity-30"
            style={{ background: domain.accent, color: "#07080c" }}
            aria-label="Envoyer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function CollapseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-white"
      title="Réduire le copilote"
      aria-label="Réduire le copilote"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 6l6 6-6 6" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function Dot({ d, delay }: { d: string; delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full"
      style={{ background: d, animationDelay: `${delay}s` }}
    />
  );
}

const SUGGESTIONS: Record<string, string[]> = {
  home: [
    "Quelles devraient être mes 3 priorités aujourd'hui ?",
    "Où ma vie est-elle déséquilibrée en ce moment ?",
  ],
  sante: [
    "Analyse mes KPIs et donne-moi 3 priorités cette semaine.",
    "Propose une routine du matin de 20 minutes.",
  ],
  finances: [
    "Où optimiser mon taux d'épargne ?",
    "Fais le point sur mes projets financiers en cours.",
  ],
  business: [
    "Quels leviers pour passer de 14k à 20k de MRR ?",
    "Priorise mes projets business par impact.",
  ],
  travail: [
    "Construis mon plan de la semaine en blocs de focus.",
    "Comment réduire mes réunions sans friction ?",
  ],
  vision: [
    "Aide-moi à clarifier mes 5 objectifs majeurs pour 2026.",
    "Découpe mon objectif de liberté financière en jalons trimestriels.",
  ],
  knowledge: [
    "Aide-moi à structurer mes notes avec la méthode PARA.",
    "Résume les connexions entre mes projets de connaissance.",
  ],
  agents: [
    "Conçois un agent qui trie ma boîte mail.",
    "Quels garde-fous mettre sur mes agents autonomes ?",
  ],
};
