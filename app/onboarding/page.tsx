"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Gender } from "@/lib/scoring";
import AvatarPicker from "@/components/AvatarPicker";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: name.trim(),
      gender,
      avatar,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome 👋</h1>
          <p className="mt-1 text-sm text-ink/60">
            Two quick things so we can score you right.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-ink/70">Display name</span>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="what should the group see?"
            className="mt-1 w-full rounded-xl border border-ink/15 bg-surface px-4 py-3 outline-none focus:border-clay"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-ink/70">
            Scoring profile
          </span>
          <p className="mb-2 mt-0.5 text-xs text-ink/45">
            Determines your workout / step thresholds.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: "f", label: "Girls", sub: "15m·45m / 5k" },
              { v: "m", label: "Guys", sub: "30m / 10k" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setGender(opt.v)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  gender === opt.v
                    ? "border-clay bg-clay/10"
                    : "border-ink/15 bg-surface"
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className="text-xs text-ink/50">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-ink/70">Pick an avatar</span>
          <p className="mb-2 mt-0.5 text-xs text-ink/45">
            How the group spots you on the leaderboard.
          </p>
          <AvatarPicker value={avatar} onPick={setAvatar} />
        </div>

        <button
          type="submit"
          disabled={loading || !gender || !name.trim() || !avatar}
          className="w-full rounded-xl bg-clay px-4 py-3 font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "Saving…" : "Start tracking"}
        </button>
        {error && <p className="text-sm text-clay">{error}</p>}
      </form>
    </main>
  );
}
