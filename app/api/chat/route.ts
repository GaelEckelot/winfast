import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequest {
  messages: ChatMessage[];
  /** Domain-specific assistant context. */
  context?: string;
  /** Optional snapshot of the domain's KPIs/projects for grounding. */
  snapshot?: string;
}

const GLOBAL_SYSTEM = `Tu es WinFast, l'intelligence qui augmente le "Life OS" de l'utilisateur — un dashboard minimaliste et futuriste pour piloter sa vie.
Style: clair, direct, concret, orienté action. Réponds en français.
Format: privilégie des réponses courtes et structurées (puces, étapes, chiffres). Pas de remplissage.
Tu peux raisonner sur les KPIs et projets fournis pour proposer des priorités et des prochaines actions.
Tu ne donnes jamais de conseils médicaux, juridiques ou financiers réglementés définitifs : tu informes et tu renvoies vers un professionnel quand c'est pertinent.`;

/** Returns the API key only if it looks real — ignores empty values and the
 *  `sk-ant-...` placeholder from .env.local.example so the app stays in
 *  "free / coming soon" mode until a genuine key is provided. */
function resolveApiKey(): string | null {
  const k = process.env.ANTHROPIC_API_KEY?.trim();
  if (!k || k.includes("...") || k.length < 25) return null;
  return k;
}

// --- Input bounds (cap the cost of any single request) ---
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 6000;
const MAX_CONTEXT_CHARS = 4000;
const MAX_SNAPSHOT_CHARS = 8000;

// --- Lightweight rate limiting (best-effort, per-instance) ---
// Durable limiting (e.g. Upstash Redis) is recommended for production, since
// serverless instances don't share this map. This still throttles bursts.
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    // Avoid unbounded growth on a long-lived instance.
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_LIMIT;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "unknown";
}

/** Lightweight status check so the client can render the copilot as
 *  "enabled" or "coming soon" without making a failing chat request. */
export async function GET() {
  return Response.json({ enabled: resolveApiKey() !== null });
}

export async function POST(req: Request) {
  // Once Supabase is configured, the copilot is reserved to signed-in users
  // (prevents the endpoint from being an open, billable AI proxy).
  let rateKey = `ip:${clientIp(req)}`;
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Non authentifié." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    rateKey = `user:${user.id}`;
  }

  if (rateLimited(rateKey)) {
    return new Response(
      JSON.stringify({ error: "Trop de requêtes. Réessaie dans une minute." }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Clé API manquante. Ajoute ANTHROPIC_API_KEY dans .env.local (voir .env.local.example) puis relance le serveur.",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Validate & clamp the conversation: only user/assistant turns, bounded size.
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim(),
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Aucun message." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const context = typeof body.context === "string" ? body.context.slice(0, MAX_CONTEXT_CHARS) : "";
  const snapshot =
    typeof body.snapshot === "string" ? body.snapshot.slice(0, MAX_SNAPSHOT_CHARS) : "";

  const system = [
    GLOBAL_SYSTEM,
    context ? `\nContexte du module:\n${context}` : "",
    snapshot ? `\nÉtat actuel (données live):\n${snapshot}` : "",
  ].join("\n");

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const llm = client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 1500,
          thinking: { type: "adaptive" },
          output_config: { effort: "medium" },
          system,
          messages,
        });

        llm.on("text", (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });

        await llm.finalMessage();
        controller.close();
      } catch (err) {
        // Log details server-side; never leak provider/internal errors to the client.
        console.error("WinFast — erreur copilote IA:", err);
        controller.enqueue(
          encoder.encode("\n\n⚠️ Le copilote est momentanément indisponible. Réessaie plus tard."),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
