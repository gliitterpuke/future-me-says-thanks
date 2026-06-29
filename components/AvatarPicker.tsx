"use client";

import { AVATARS } from "@/lib/avatars";

export default function AvatarPicker({
  value,
  onPick,
}: {
  value: string | null;
  onPick: (emoji: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {AVATARS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          className={`aspect-square rounded-xl border text-2xl transition ${
            value === emoji
              ? "border-clay bg-clay/10 scale-105"
              : "border-ink/10 bg-surface hover:border-clay/40"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
