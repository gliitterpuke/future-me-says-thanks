// ============================================================
// Scoring rules — single source of truth, shared everywhere.
// ============================================================
//
//  Eat healthy ............... 1 pt   (everyone)
//  Workout (girls) ........... 15m = 1 pt   |  45m = 2 pt
//  Workout (guys) ............ 30m = 1 pt
//  Walk (girls) .............. 5k steps  = 1 pt
//  Walk (guys) ............... 10k steps = 1 pt
//  Max 3 points per day. Workout tiers don't stack (no 15m + 45m).
//  Exempt days (sick / period) are EXCLUDED from the tally entirely.

export type Gender = "f" | "m";
export type Workout = "none" | "lvl1" | "lvl2";
export type ExemptReason = "sick" | "period";

export const MAX_DAILY = 3;

export interface Entry {
  date: string; // YYYY-MM-DD
  eat: boolean;
  workout: Workout;
  walk: boolean;
  exempt: boolean;
  exempt_reason: ExemptReason | null;
  note?: string; // private, persisted separately in entry_notes
}

export function emptyEntry(date: string): Entry {
  return {
    date,
    eat: false,
    workout: "none",
    walk: false,
    exempt: false,
    exempt_reason: null,
    note: "",
  };
}

// ---- Labels, gender-aware ------------------------------------
export function workoutOptions(gender: Gender): { value: Workout; label: string; pts: number }[] {
  if (gender === "m") {
    return [
      { value: "none", label: "None", pts: 0 },
      { value: "lvl1", label: "Workout 30m", pts: 1 },
    ];
  }
  return [
    { value: "none", label: "None", pts: 0 },
    { value: "lvl1", label: "Workout 15m", pts: 1 },
    { value: "lvl2", label: "Workout 45m", pts: 2 },
  ];
}

export function walkLabel(gender: Gender): string {
  return gender === "m" ? "Walk 10k steps" : "Walk 5k steps";
}

export function workoutPoints(workout: Workout, gender: Gender): number {
  if (workout === "lvl2") return gender === "m" ? 0 : 2; // guys have no lvl2
  if (workout === "lvl1") return 1;
  return 0;
}

// Raw points before the daily cap.
export function rawPoints(entry: Entry, gender: Gender): number {
  return (
    (entry.eat ? 1 : 0) +
    (entry.walk ? 1 : 0) +
    workoutPoints(entry.workout, gender)
  );
}

// Points that actually count for a single day.
export function dayPoints(entry: Entry, gender: Gender): number {
  if (entry.exempt) return 0; // excluded from the tally
  return Math.min(MAX_DAILY, rawPoints(entry, gender));
}

export interface Tally {
  points: number; // total counted points in the period
  activeDays: number; // non-exempt days that had an entry
  exemptDays: number;
  possible: number; // activeDays * MAX_DAILY  (denominator for %)
  pct: number; // 0..100
}

// Aggregate a set of entries (already filtered to a period) for one person.
export function tally(entries: Entry[], gender: Gender): Tally {
  let points = 0;
  let activeDays = 0;
  let exemptDays = 0;

  for (const e of entries) {
    if (e.exempt) {
      exemptDays += 1;
      continue;
    }
    const p = dayPoints(e, gender);
    points += p;
    activeDays += 1;
  }

  const possible = activeDays * MAX_DAILY;
  const pct = possible === 0 ? 0 : Math.round((points / possible) * 100);
  return { points, activeDays, exemptDays, possible, pct };
}
