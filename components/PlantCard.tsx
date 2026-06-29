"use client";

import { type Plant } from "@/lib/plant";

export default function PlantCard({
  plant,
  streak,
}: {
  plant: Plant;
  streak: number;
}) {
  return (
    <div className="mb-5 flex items-center gap-4 rounded-2xl border border-ink/10 bg-surface px-5 py-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage/15 text-3xl">
        {plant.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{plant.title}</div>
        <div className="truncate text-xs text-ink/50">{plant.blurb}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold leading-none">
          {streak > 0 ? `🔥 ${streak}` : "—"}
        </div>
        <div className="mt-1 text-[11px] text-ink/40">streak</div>
      </div>
    </div>
  );
}
