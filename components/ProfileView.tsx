"use client";

import { useMemo, useState } from "react";
import { type Entry, type Gender, dayPoints, MAX_DAILY } from "@/lib/scoring";
import { challengeProgress, currentStreak, CHALLENGE } from "@/lib/challenge";
import { avatarOrDefault } from "@/lib/avatars";
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  addMonths,
  monthGrid,
  toKey,
  todayKey,
} from "@/lib/date";
import ProgressRing from "@/components/ProgressRing";

export default function ProfileView({
  name,
  avatar,
  gender,
  isMe,
  entries,
}: {
  name: string;
  avatar: string | null;
  gender: Gender;
  isMe: boolean;
  entries: Entry[];
}) {
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const today = todayKey();

  const byKey = useMemo(() => {
    const map: Record<string, Entry> = {};
    for (const e of entries) map[e.date] = e;
    return map;
  }, [entries]);

  const progress = useMemo(
    () => challengeProgress(entries, gender),
    [entries, gender],
  );
  const streak = useMemo(
    () => currentStreak(entries, gender),
    [entries, gender],
  );
  const grid = useMemo(() => monthGrid(year, month), [year, month]);

  return (
    <section className="mt-4">
      {/* Header */}
      <div className="mb-5 flex items-center gap-4 rounded-2xl bg-clay/10 px-5 py-4">
        <ProgressRing
          pct={((progress.consumedDays || 0) / CHALLENGE.days) * 100}
          center={progress.finished ? "🎉" : `${progress.consumedDays || 0}`}
          sub={progress.finished ? "done" : `/ ${CHALLENGE.days}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-xl">
              {avatarOrDefault(avatar)}
            </span>
            <span className="truncate text-lg font-bold">
              {name}
              {isMe && (
                <span className="ml-1.5 text-xs font-normal text-clay">you</span>
              )}
            </span>
          </div>
          <div className="mt-1 text-sm text-ink/55">
            {progress.points} / {progress.maxPossible} pts · {progress.pct}%
            {streak > 0 && <> · 🔥{streak}</>}
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

      {/* Read-only grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((d) => {
          const key = toKey(d);
          const inMonth = d.getMonth() === month;
          const isToday = key === today;
          const entry = byKey[key];
          const pts = entry ? dayPoints(entry, gender) : 0;
          const exempt = entry?.exempt;

          return (
            <div
              key={key}
              className={[
                "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm",
                inMonth ? "bg-surface" : "bg-transparent",
                "border-ink/10",
                isToday ? "ring-2 ring-clay" : "",
                !inMonth ? "text-ink/30" : "",
              ].join(" ")}
            >
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
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-ink/40">
        Activity only — notes are private to each person.
      </p>
    </section>
  );
}
