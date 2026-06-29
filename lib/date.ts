// Local-date helpers. We always key entries by the user's local calendar day
// (YYYY-MM-DD) to avoid timezone drift from toISOString().

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 6x7 grid of dates for a month view (Monday-first). Includes leading/trailing
// days from neighbouring months so the grid is always full.
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  // JS: 0=Sun..6=Sat. Convert to Monday-first offset.
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

// First (Mon) and last (Sun) day-keys of the ISO-ish week containing `d`.
export function weekRange(d: Date): { start: string; end: string } {
  const offset = (d.getDay() + 6) % 7;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start: toKey(start), end: toKey(end) };
}

export function monthRange(year: number, month: number): { start: string; end: string } {
  return {
    start: toKey(new Date(year, month, 1)),
    end: toKey(new Date(year, month + 1, 0)),
  };
}
