"use client";

import { useState } from "react";
import {
  type Gender,
  walkLabel,
  workoutOptions,
  MAX_DAILY,
} from "@/lib/scoring";

function Row({ label, pts }: { label: string; pts: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-ink/70">{label}</span>
      <span className="font-semibold text-sage">{pts}</span>
    </div>
  );
}

export default function ScoringReminder({ gender }: { gender: Gender }) {
  const [open, setOpen] = useState(false);
  const workouts = workoutOptions(gender).filter((o) => o.value !== "none");

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <span className="text-sm font-semibold">How points work</span>
        <span className="text-ink/40">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-ink/10 px-5 py-3 text-sm">
          <Row label="Eat healthy" pts="1 pt" />
          {workouts.map((w) => (
            <Row
              key={w.value}
              label={w.label}
              pts={`${w.pts} pt${w.pts > 1 ? "s" : ""}`}
            />
          ))}
          <Row label={walkLabel(gender)} pts="1 pt" />

          <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-xs text-ink/50">
            <li>· Max {MAX_DAILY} points a day.</li>
            <li>· Workouts don&apos;t stack — pick one tier, not both.</li>
            <li>
              · 💤 sick / 🌸 period = day off. Doesn&apos;t count, and adds a day
              to your challenge.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
