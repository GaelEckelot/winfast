import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequest {
  messages: ChatMessage[];
  /** Domain-specific assistant context. */
  context?: string;
  /** Optional snapshot of the domain's KPIs/projects for grounding. */
  snapshot?: string;
}

const GLOBAL_SYSTEM = `Tu es UPPER LIFE, l'intelligence qui augmente le "Life OS" de l'utilisateur — un dashboard minimaliste et futuriste pour piloter sa vie.
Style: clair, direct, concret, orienté action. Réponds en français.
Format: privilégie des réponses courtes et structurées (puces, étapes, chiffres). Pas de remplissage.
Tu peux raisonner sur les KPIs et projets fournis pour proposer des priorités et des prochaines actions.
Tu ne donnes jamais de conseils médicaux, juridiques ou financiers réglementés définitifs : tu informes et tu renvoies vers un professionnel quand c'est pertinent.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
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

  const messages = (body.messages ?? [])
    .filter((m) => m.content?.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Aucun message." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const system = [
    GLOBAL_SYSTEM,
    body.context ? `\nContexte du module:\n${body.context}` : "",
    body.snapshot ? `\nÉtat actuel (données live):\n${body.snapshot}` : "",
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
        const msg =
          err instanceof Error ? err.message : "Erreur inconnue côté IA.";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
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
