"use client";

import { useState } from "react";
import {
  type Entry,
  type Gender,
  type Workout,
  type ExemptReason,
  dayPoints,
  rawPoints,
  walkLabel,
  workoutOptions,
  MAX_DAILY,
} from "@/lib/scoring";
import { fromKey, MONTH_NAMES, WEEKDAY_LABELS } from "@/lib/date";

export default function DayEditor({
  gender,
  entry,
  onClose,
  onSave,
}: {
  gender: Gender;
  entry: Entry;
  onClose: () => void;
  onSave: (e: Entry) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<Entry>(entry);
  const [saving, setSaving] = useState(false);

  const d = fromKey(draft.date);
  const heading = `${WEEKDAY_LABELS[(d.getDay() + 6) % 7]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;

  const counted = dayPoints(draft, gender);
  const raw = rawPoints(draft, gender);
  const capped = raw > MAX_DAILY && !draft.exempt;

  const woOpts = workoutOptions(gender);

  function set(patch: Partial<Entry>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function toggleExempt(reason: ExemptReason) {
    setDraft((prev) =>
      prev.exempt && prev.exempt_reason === reason
        ? { ...prev, exempt: false, exempt_reason: null }
        : { ...prev, exempt: true, exempt_reason: reason },
    );
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
  }

  const disabled = draft.exempt;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-t-3xl bg-sheet p-6 pb-8 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{heading}</h3>
            <p className="text-xs text-ink/45">
              {draft.exempt
                ? "Exempt — excluded from your tally"
                : `${counted} of ${MAX_DAILY} pts${capped ? " (capped)" : ""}`}
            </p>
          </div>
          <span className="flex gap-1">
            {Array.from({ length: MAX_DAILY }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  !draft.exempt && i < counted ? "bg-sage" : "bg-ink/10"
                }`}
              />
            ))}
          </span>
        </div>

        <div className={disabled ? "pointer-events-none opacity-40" : ""}>
          {/* Eat */}
          <Toggle
            label="Eat healthy"
            sub="1 pt"
            on={draft.eat}
            onClick={() => set({ eat: !draft.eat })}
          />

          {/* Workout */}
          <div className="mt-3">
            <div className="mb-1.5 text-sm font-medium text-ink/70">Workout</div>
            <div className="grid grid-cols-3 gap-2">
              {woOpts.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set({ workout: opt.value as Workout })}
                  className={`rounded-xl border px-2 py-3 text-center text-sm transition ${
                    draft.workout === opt.value
                      ? "border-clay bg-clay/10 font-semibold"
                      : "border-ink/10 bg-surface"
                  }`}
                >
                  <div>{opt.label}</div>
                  {opt.pts > 0 && (
                    <div className="text-[11px] text-ink/45">
                      {opt.pts} pt{opt.pts > 1 ? "s" : ""}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Walk */}
          <div className="mt-3">
            <Toggle
              label={walkLabel(gender)}
              sub="1 pt"
              on={draft.walk}
              onClick={() => set({ walk: !draft.walk })}
            />
          </div>
        </div>

        {/* Exempt */}
        <div className="mt-5 border-t border-ink/10 pt-4">
          <div className="mb-2 text-sm font-medium text-ink/70">
            Day off (excluded from tally)
          </div>
          <div className="flex gap-2">
            <ExemptButton
              label="💤 Sick"
              on={draft.exempt && draft.exempt_reason === "sick"}
              onClick={() => toggleExempt("sick")}
            />
            {gender === "f" && (
              <ExemptButton
                label="🌸 Period"
                on={draft.exempt && draft.exempt_reason === "period"}
                onClick={() => toggleExempt("period")}
              />
            )}
          </div>
        </div>

        {/* Note (private) */}
        <div className="mt-5 border-t border-ink/10 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-ink/70">Note</span>
            <span className="text-[11px] text-ink/40">only you can see this</span>
          </div>
          <textarea
            value={draft.note ?? ""}
            onChange={(e) => set({ note: e.target.value })}
            rows={3}
            placeholder="how'd it go? anything to remember…"
            className="w-full resize-none rounded-xl border border-ink/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-clay"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-ink/15 px-4 py-3 font-medium text-ink/60"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] rounded-xl bg-clay px-4 py-3 font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  sub,
  on,
  onClick,
}: {
  label: string;
  sub: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
        on ? "border-clay bg-clay/10" : "border-ink/10 bg-surface"
      }`}
    >
      <span>
        <span className="font-medium">{label}</span>
        <span className="ml-2 text-xs text-ink/45">{sub}</span>
      </span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
          on ? "border-clay bg-clay text-white" : "border-ink/20 text-transparent"
        }`}
      >
        ✓
      </span>
    </button>
  );
}

function ExemptButton({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
        on ? "border-sun bg-sun/15" : "border-ink/10 bg-surface"
      }`}
    >
      {label}
    </button>
  );
}
