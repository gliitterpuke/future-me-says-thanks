// ============================================================
// The 30-day challenge.
//
// The goal is 30 *non-exempt* days. A day within the window that is marked
// exempt (sick / period) does NOT consume one of your 30 days — so each exempt
// day effectively pushes your finish line out by one calendar day ("+1 day").
// A normal day always consumes a challenge day, even if you logged nothing
// (that's a 0/3 day) — only sick/period are excused.
// ============================================================

import { fromKey, toKey, todayKey } from "./date";
import { type Entry, type Gender, dayPoints, MAX_DAILY } from "./scoring";

// Current streak of perfect (3/3) days, counting back from today.
// - Exempt days (sick / period) bridge the streak — they neither add nor break.
// - Today gets grace: if it isn't perfect yet, the streak still stands on
//   yesterday's run rather than resetting to 0 mid-day.
export function currentStreak(
  entries: Entry[],
  gender: Gender,
  todayK: string = todayKey(),
): number {
  const byDate: Record<string, Entry> = {};
  for (const e of entries) byDate[e.date] = e;

  const start = fromKey(CHALLENGE.start);
  let streak = 0;

  for (
    let d = fromKey(todayK);
    d >= start;
    d.setDate(d.getDate() - 1)
  ) {
    const key = toKey(d);
    const e = byDate[key];
    if (e?.exempt) continue; // bridge
    const perfect = !!e && dayPoints(e, gender) >= MAX_DAILY;
    if (perfect) {
      streak += 1;
    } else if (key === todayK) {
      continue; // today still in progress — don't break
    } else {
      break;
    }
  }

  return streak;
}

export const CHALLENGE = {
  // First day of the challenge. CHANGE THIS to your group's start date.
  start: "2026-06-30",
  days: 30,
};

export interface ChallengeProgress {
  points: number; // counted points so far
  consumedDays: number; // your "Day N of 30"
  exemptDays: number; // excused days so far (each adds a calendar day)
  remainingDays: number; // challenge days left to reach 30
  finished: boolean;
  finishDateKey: string | null; // calendar day you hit day 30
  possibleSoFar: number; // consumedDays * 3
  maxPossible: number; // days * 3
  pct: number; // points / possibleSoFar, 0..100
}

// Walk the calendar from the challenge start up to `todayK`, consuming a
// challenge day for every non-exempt day until we reach `CHALLENGE.days`.
export function challengeProgress(
  entries: Entry[],
  gender: Gender,
  todayK: string = todayKey(),
): ChallengeProgress {
  const byDate: Record<string, Entry> = {};
  for (const e of entries) byDate[e.date] = e;

  let points = 0;
  let consumedDays = 0;
  let exemptDays = 0;
  let finished = false;
  let finishDateKey: string | null = null;

  const start = fromKey(CHALLENGE.start);
  const today = fromKey(todayK);

  for (
    let d = new Date(start);
    d <= today && !finished;
    d.setDate(d.getDate() + 1)
  ) {
    const key = toKey(d);
    const e = byDate[key];
    if (e?.exempt) {
      exemptDays += 1;
      continue;
    }
    consumedDays += 1;
    points += e ? dayPoints(e, gender) : 0;
    if (consumedDays >= CHALLENGE.days) {
      finished = true;
      finishDateKey = key;
    }
  }

  const remainingDays = Math.max(0, CHALLENGE.days - consumedDays);
  const possibleSoFar = consumedDays * MAX_DAILY;
  const maxPossible = CHALLENGE.days * MAX_DAILY;
  const pct =
    possibleSoFar === 0 ? 0 : Math.round((points / possibleSoFar) * 100);

  return {
    points,
    consumedDays,
    exemptDays,
    remainingDays,
    finished,
    finishDateKey,
    possibleSoFar,
    maxPossible,
    pct,
  };
}
