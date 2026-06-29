"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarPicker from "@/components/AvatarPicker";
import { avatarOrDefault } from "@/lib/avatars";

export default function Nav({
  active,
  name,
  userId,
  avatar,
}: {
  active: "today" | "leaderboard";
  name: string;
  userId: string;
  avatar: string | null;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(avatar);
  const [picking, setPicking] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function pick(emoji: string) {
    setCurrent(emoji);
    setPicking(false);
    const supabase = createClient();
    await supabase.from("profiles").update({ avatar: emoji }).eq("id", userId);
  }

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">
          future me <span className="text-clay">says thanks</span>
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setPicking((p) => !p)}
              className="flex items-center gap-1.5 rounded-full border border-ink/15 py-1 pl-1 pr-2.5 text-xs text-ink/60 transition hover:border-ink/30"
              title="Change avatar"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/5 text-base">
                {avatarOrDefault(current)}
              </span>
              {name}
            </button>
            {picking && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPicking(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-ink/10 bg-sheet p-3 shadow-xl">
                  <div className="mb-2 text-xs font-medium text-ink/50">
                    Pick your avatar
                  </div>
                  <AvatarPicker value={current} onPick={pick} />
                </div>
              </>
            )}
          </div>
          <button
            onClick={signOut}
            className="text-xs text-ink/40 underline-offset-2 hover:underline"
          >
            sign out
          </button>
        </div>
      </div>

      <nav className="mt-4 inline-flex rounded-full bg-ink/5 p-1 text-sm">
        <Link
          href="/"
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            active === "today" ? "bg-surface shadow-sm" : "text-ink/50"
          }`}
        >
          My calendar
        </Link>
        <Link
          href="/leaderboard"
          className={`rounded-full px-4 py-1.5 font-medium transition ${
            active === "leaderboard" ? "bg-surface shadow-sm" : "text-ink/50"
          }`}
        >
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}
