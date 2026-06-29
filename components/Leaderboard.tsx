"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type Entry, type Gender } from "@/lib/scoring";
import {
  type ChallengeProgress,
  challengeProgress,
  currentStreak,
  CHALLENGE,
} from "@/lib/challenge";
import { avatarOrDefault } from "@/lib/avatars";
import { fromKey, MONTH_NAMES } from "@/lib/date";

interface Profile {
  id: string;
  display_name: string;
  gender: Gender;
  avatar: string | null;
}

interface Row extends ChallengeProgress {
  id: string;
  name: string;
  gender: Gender;
  avatar: string | null;
  streak: number;
}

function prettyDate(key: string) {
  const d = fromKey(key);
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export default function Leaderboard({ meId }: { meId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rawRows, setRawRows] = useState<(Entry & { user_id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: profs }, { data: ents }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, gender, avatar"),
        supabase
          .from("entries")
          .select("user_id, date, eat, workout, walk, exempt, exempt_reason"),
      ]);
      setProfiles((profs ?? []) as Profile[]);
      setRawRows((ents ?? []) as (Entry & { user_id: string })[]);
      setLoading(false);
    })();
  }, [supabase]);

  const rows = useMemo<Row[]>(() => {
    const byUser: Record<string, Entry[]> = {};
    for (const r of rawRows) (byUser[r.user_id] ||= []).push(r);

    const out = profiles.map((p) => {
      const mine = byUser[p.id] ?? [];
      const prog = challengeProgress(mine, p.gender);
      const streak = currentStreak(mine, p.gender);
      return {
        id: p.id,
        name: p.display_name,
        gender: p.gender,
        avatar: p.avatar,
        streak,
        ...prog,
      };
    });
    // Most points wins; then better %, then fewer days used (more efficient).
    out.sort(
      (a, b) =>
        b.points - a.points || b.pct - a.pct || a.consumedDays - b.consumedDays,
    );
    return out;
  }, [rawRows, profiles]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section>
      <div className="mb-5 rounded-2xl bg-sage/15 px-5 py-3 text-sm">
        <span className="font-semibold">30-day challenge</span>
        <span className="text-ink/55">
          {" "}
          · started {prettyDate(CHALLENGE.start)} · first to {CHALLENGE.days}{" "}
          days
        </span>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink/40">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink/40">
          No one&apos;s here yet.
        </p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.id}>
              <Link
                href={`/u/${r.id}`}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition hover:border-clay/40 ${
                  r.id === meId
                    ? "border-clay/40 bg-clay/5"
                    : "border-ink/10 bg-surface"
                }`}
              >
              <span className="w-7 text-center text-lg">
                {medals[i] ?? (
                  <span className="text-sm text-ink/40">{i + 1}</span>
                )}
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink/5 text-xl">
                {avatarOrDefault(r.avatar)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">
                  {r.name}
                  {r.streak > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-ink/50">
                      🔥{r.streak}
                    </span>
                  )}
                  {r.id === meId && (
                    <span className="ml-1.5 text-xs font-normal text-clay">
                      you
                    </span>
                  )}
                  {r.finished && <span className="ml-1.5">🎉</span>}
                </div>
                <div className="text-xs text-ink/45">
                  {r.finished ? (
                    <>Finished {r.finishDateKey ? prettyDate(r.finishDateKey) : ""}</>
                  ) : (
                    <>
                      Day {r.consumedDays}/{CHALLENGE.days} · {r.pct}%
                    </>
                  )}
                  {r.exemptDays > 0 && <> · {r.exemptDays} exempt</>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{r.points}</div>
                <div className="-mt-0.5 text-[11px] text-ink/40">
                  / {r.maxPossible}
                </div>
              </div>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 text-center text-xs text-ink/40">
        Ranked by points. Exempt days (sick / period) don&apos;t count — each one
        adds a day to your challenge.
      </p>
    </section>
  );
}
