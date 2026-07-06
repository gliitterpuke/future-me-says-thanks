"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // The reset link (via /auth/callback) already established a session.
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-ink/60">
            Pick something you&apos;ll remember.
          </p>
        </div>
        <input
          type="password"
          required
          minLength={6}
          autoFocus
          placeholder="new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 text-base outline-none focus:border-clay"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-clay px-4 py-3 font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save password"}
        </button>
        {error && <p className="text-sm text-clay">{error}</p>}
      </form>
    </main>
  );
}
