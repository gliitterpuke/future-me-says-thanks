"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type Entry,
  type Gender,
  dayPoints,
  emptyEntry,
  MAX_DAILY,
} from "@/lib/scoring";
import { challengeProgress, currentStreak, CHALLENGE } from "@/lib/challenge";
import { plantFor } from "@/lib/plant";
import { celebratePerfectDay, celebrateFinish } from "@/lib/celebrate";
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  addMonths,
  monthGrid,
  toKey,
  todayKey,
} from "@/lib/date";
import DayEditor from "@/components/DayEditor";
import ScoringReminder from "@/components/ScoringReminder";
import PlantCard from "@/components/PlantCard";
import MicroCopy from "@/components/MicroCopy";
import ProgressRing from "@/components/ProgressRing";
import ShareRecap from "@/components/ShareRecap";

export default function Tracker({
  userId,
  gender,
  name,
  avatar,
}: {
  userId: string;
  gender: Gender;
  name: string;
  avatar: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = todayKey();

  const load = useCallback(async () => {
    setLoading(true);
    // The whole challenge is at most ~30+ rows, so just load everything once.
    const [{ data: ents }, { data: notes }] = await Promise.all([
      supabase
        .from("entries")
        .select("date, eat, workout, walk, exempt, exempt_reason")
        .eq("user_id", userId),
      supabase.from("entry_notes").select("date, note").eq("user_id", userId),
    ]);
    const map: Record<string, Entry> = {};
    for (const row of ents ?? []) {
      map[row.date] = { ...(row as Entry), note: "" };
    }
    // Merge in notes — a note can exist on a day with no logged activity.
    for (const n of notes ?? []) {
      if (map[n.date]) map[n.date].note = n.note ?? "";
      else map[n.date] = { ...emptyEntry(n.date), note: n.note ?? "" };
    }
    setEntries(map);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const grid = useMemo(() => monthGrid(year, month), [year, month]);

  const entryList = useMemo(() => Object.values(entries), [entries]);

  const progress = useMemo(
    () => challengeProgress(entryList, gender),
    [entryList, gender],
  );

  const streak = useMemo(
    () => currentStreak(entryList, gender),
    [entryList, gender],
  );

  const plant = useMemo(() => {
    const everActive = entryList.some(
      (e) => !e.exempt && dayPoints(e, gender) > 0,
    );
    return plantFor(streak, progress.finished, everActive);
  }, [entryList, gender, streak, progress.finished]);

  async function saveEntry(next: Entry) {
    // Celebrate newly-perfect days (and finishing the whole challenge).
    const wasPerfect = (entries[next.date] && !entries[next.date].exempt
      ? dayPoints(entries[next.date], gender)
      : 0) >= MAX_DAILY;
    const nowPerfect = !next.exempt && dayPoints(next, gender) >= MAX_DAILY;
    if (nowPerfect && !wasPerfect) {
      const after = challengeProgress(
        [...entryList.filter((e) => e.date !== next.date), next],
        gender,
      );
      if (after.finished && !progress.finished) celebrateFinish();
      else celebratePerfectDay();
    }

    // optimistic
    setEntries((prev) => ({ ...prev, [next.date]: next }));
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from("entries").upsert(
        {
          user_id: userId,
          date: next.date,
          eat: next.eat,
          workout: next.workout,
          walk: next.walk,
          exempt: next.exempt,
          exempt_reason: next.exempt ? next.exempt_reason : null,
          updated_at: now,
        },
        { onConflict: "user_id,date" },
      ),
      // Notes live in their own private table.
      supabase.from("entry_notes").upsert(
        {
          user_id: userId,
          date: next.date,
          note: next.note?.trim() ?? "",
          updated_at: now,
        },
        { onConflict: "user_id,date" },
      ),
    ]);
  }

  const selectedEntry = selected
    ? entries[selected] ?? emptyEntry(selected)
    : null;

  return (
    <section>
      {/* Daily affirmation */}
      <MicroCopy />

      {/* Plant + streak */}
      <PlantCard plant={plant} streak={streak} />

      {/* Challenge progress */}
      <div className="mb-5 flex items-center gap-5 rounded-2xl bg-clay/10 px-5 py-4">
        <ProgressRing
          pct={((progress.consumedDays || 0) / CHALLENGE.days) * 100}
          center={progress.finished ? "🎉" : `${progress.consumedDays || 0}`}
          sub={progress.finished ? "done" : `/ ${CHALLENGE.days}`}
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-clay">
            {progress.finished ? "Challenge complete" : "30-day challenge"}
          </div>
          <div className="text-2xl font-bold text-ink">
            {progress.points}
            <span className="text-base font-semibold text-ink/40">
              {" "}
              / {progress.maxPossible} pts
            </span>
          </div>
          <div className="mt-0.5 text-xs text-ink/50">
            {progress.finished ? (
              <>finished it 💪</>
            ) : (
              <>
                {progress.remainingDays} day
                {progress.remainingDays === 1 ? "" : "s"} to go
              </>
            )}
            {progress.exemptDays > 0 && (
              <> · {progress.exemptDays} exempt (+{progress.exemptDays}d)</>
            )}
          </div>
        </div>
      </div>

      {/* Month header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="rounded-full px-3 py-1 text-ink/40 hover:bg-ink/5"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="text-base font-semibold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded-full px-3 py-1 text-ink/40 hover:bg-ink/5"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-ink/35">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className={`grid grid-cols-7 gap-1.5 ${loading ? "opacity-50" : ""}`}>
        {grid.map((d) => {
          const key = toKey(d);
          const inMonth = d.getMonth() === month;
          const isFuture = key > today;
          const isToday = key === today;
          const entry = entries[key];
          const pts = entry ? dayPoints(entry, gender) : 0;
          const exempt = entry?.exempt;
          const hasNote = !!entry?.note && entry.note.trim().length > 0;

          return (
            <button
              key={key}
              disabled={isFuture}
              onClick={() => setSelected(key)}
              className={[
                "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition",
                inMonth ? "bg-surface" : "bg-transparent",
                isFuture
                  ? "cursor-default border-transparent text-ink/20"
                  : "border-ink/10 hover:border-clay/40",
                isToday ? "ring-2 ring-clay" : "",
                !inMonth && !isFuture ? "text-ink/30" : "",
              ].join(" ")}
            >
              {hasNote && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-clay/70" />
              )}

              <span className={pts > 0 || exempt ? "font-semibold" : ""}>
                {d.getDate()}
              </span>

              {exempt ? (
                <span className="mt-1 text-[10px] leading-none text-sun">
                  {entry?.exempt_reason === "period" ? "🌸" : "💤"}
                </span>
              ) : (
                <span className="mt-1 flex gap-0.5">
                  {Array.from({ length: MAX_DAILY }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i < pts ? "bg-sage" : "bg-ink/10"
                      }`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-ink/40">
        Tap a day to log it · max {MAX_DAILY} pts/day
      </p>

      <ScoringReminder gender={gender} />

      <ShareRecap
        name={name}
        avatar={avatar}
        gender={gender}
        progress={progress}
        streak={streak}
        plant={plant}
      />

      {selected && selectedEntry && (
        <DayEditor
          gender={gender}
          entry={selectedEntry}
          onClose={() => setSelected(null)}
          onSave={async (e) => {
            await saveEntry(e);
            setSelected(null);
          }}
        />
      )}
    </section>
  );
}
