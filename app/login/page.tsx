"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = "magic" | "password";
type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("magic");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function reset() {
    setError(null);
    setInfo(null);
  }

  // ---- Magic link --------------------------------------------------
  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo(`Check ${email} for a sign-in link.`);
  }

  // ---- Password ----------------------------------------------------
  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (data.session) {
        router.replace("/");
        router.refresh();
      } else {
        setInfo(`Almost there — check ${email} to confirm your account.`);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/");
    router.refresh();
  }

  async function forgotPassword() {
    reset();
    if (!email.trim()) return setError("Enter your email first.");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo(`Sent a password-reset link to ${email}.`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          future me <span className="text-clay">says thanks</span>
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          A tiny daily tracker for the group.
        </p>

        {/* Tabs */}
        <div className="mt-6 inline-flex rounded-full bg-ink/5 p-1 text-sm">
          {(["magic", "password"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                reset();
              }}
              className={`rounded-full px-4 py-1.5 font-medium capitalize transition ${
                tab === t ? "bg-surface shadow-sm" : "text-ink/50"
              }`}
            >
              {t === "magic" ? "Magic link" : "Password"}
            </button>
          ))}
        </div>

        {info ? (
          <div className="mt-6 rounded-2xl bg-sage/15 p-5 text-sm text-ink/80">
            {info}
          </div>
        ) : tab === "magic" ? (
          <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
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
            <p className="text-center text-xs text-ink/45">
              No password — we email you a one-tap link.
            </p>
          </form>
        ) : (
          <form onSubmit={submitPassword} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 text-base outline-none focus:border-clay"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 text-base outline-none focus:border-clay"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-clay px-4 py-3 font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
            >
              {loading
                ? "…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>

            <div className="flex items-center justify-between text-xs text-ink/50">
              <button
                type="button"
                onClick={() => {
                  setMode((m) => (m === "signin" ? "signup" : "signin"));
                  reset();
                }}
                className="underline-offset-2 hover:underline"
              >
                {mode === "signin"
                  ? "Create an account"
                  : "I already have an account"}
              </button>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={forgotPassword}
                  className="underline-offset-2 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </form>
        )}

        {error && <p className="mt-3 text-sm text-clay">{error}</p>}
      </div>
    </main>
  );
}
