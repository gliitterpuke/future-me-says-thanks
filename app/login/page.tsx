"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          future me <span className="text-clay">says thanks</span>
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          A tiny daily tracker for the group. Sign in with your email — we&apos;ll
          send a magic link, no password.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl bg-sage/15 p-5 text-sm text-ink/80">
            Check <span className="font-semibold">{email}</span> for a sign-in
            link. You can close this tab once you click it.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 text-base outline-none focus:border-clay"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-clay px-4 py-3 font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
            {error && <p className="text-sm text-clay">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
