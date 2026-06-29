"use client";

import { useRef, useState } from "react";
import RecapCard from "@/components/RecapCard";
import { type ChallengeProgress } from "@/lib/challenge";
import { type Plant } from "@/lib/plant";
import { type Gender } from "@/lib/scoring";

export default function ShareRecap({
  name,
  avatar,
  progress,
  streak,
  plant,
}: {
  name: string;
  avatar: string | null;
  gender: Gender;
  progress: ChallengeProgress;
  streak: number;
  plant: Plant;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function share() {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "my-challenge-recap.png", {
        type: "image/png",
      });

      // Prefer the native share sheet (mobile); fall back to a download.
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "My challenge recap",
          text: "future me says thanks 💪",
        });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "my-challenge-recap.png";
        a.click();
      }
    } catch {
      // user cancelled the share sheet, or export failed — no-op
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={share}
        disabled={busy}
        className="mt-4 w-full rounded-2xl border border-ink/15 bg-surface px-4 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? "Making your card…" : "📤 Share my recap"}
      </button>

      {/* Off-screen card used only for the PNG export. */}
      <div
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <RecapCard
          ref={cardRef}
          name={name}
          avatar={avatar}
          progress={progress}
          streak={streak}
          plant={plant}
        />
      </div>
    </>
  );
}
