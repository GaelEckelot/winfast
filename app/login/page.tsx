"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Logo } from "@/components/Logo";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // If email confirmation is disabled, a session is returned right away.
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setInfo("Compte créé. Vérifie tes emails pour confirmer, puis connecte-toi.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid-overlay flex min-h-screen items-center justify-center px-5">
      <div className="glass w-full max-w-sm rounded-2xl p-7 animate-fade-up">
        <div className="mb-5 flex flex-col items-center text-center">
          <Logo size={44} />
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-ink">WinFast</h1>
          <p className="mt-1 text-sm text-muted">Réussir sa vie, plus vite.</p>
        </div>

        {!configured ? (
          <p className="rounded-lg border border-line/10 bg-line/[0.04] p-4 text-center text-sm text-muted">
            La connexion n&apos;est pas encore configurée. Ajoute tes clés Supabase dans
            <code className="mx-1 text-ink/80">.env.local</code> pour activer les comptes.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-line/10 bg-line/[0.04] px-3 py-2.5 text-ink outline-none transition-colors focus:border-accent/60"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full rounded-lg border border-line/10 bg-line/[0.04] px-3 py-2.5 text-ink outline-none transition-colors focus:border-accent/60"
            />

            {error && <p className="text-[13px] text-accent-rose">{error}</p>}
            {info && <p className="text-[13px] text-accent-soft">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "#1f63c9" }}
            >
              {loading
                ? "…"
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode((m) => (m === "signin" ? "signup" : "signin"));
                setError(null);
                setInfo(null);
              }}
              className="w-full text-center text-[13px] text-muted transition-colors hover:text-ink"
            >
              {mode === "signin"
                ? "Pas encore de compte ? Créer un compte"
                : "Déjà un compte ? Se connecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
