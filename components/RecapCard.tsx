"use client";

import { forwardRef } from "react";
import { type ChallengeProgress, CHALLENGE } from "@/lib/challenge";
import { type Plant } from "@/lib/plant";
import { avatarOrDefault } from "@/lib/avatars";
import { fromKey, MONTH_NAMES } from "@/lib/date";

const CLAY = "#e9624a";
const SAGE = "#6f9b73";
const INK = "#2a2622";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#ffffff",
        borderRadius: 16,
        padding: "14px 10px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color: INK }}>{value}</div>
      <div style={{ fontSize: 12, color: "#2a262299", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// Fixed-size card rendered off-screen and exported to PNG. Uses explicit
// colors (not theme vars) so the image looks the same for everyone.
const RecapCard = forwardRef<
  HTMLDivElement,
  {
    name: string;
    avatar: string | null;
    progress: ChallengeProgress;
    streak: number;
    plant: Plant;
  }
>(function RecapCard({ name, avatar, progress, streak, plant }, ref) {
  const start = fromKey(CHALLENGE.start);

  return (
    <div
      ref={ref}
      style={{
        width: 540,
        padding: 36,
        boxSizing: "border-box",
        background: "linear-gradient(160deg, #fbf7f0 0%, #f4e8d8 100%)",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        color: INK,
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
          }}
        >
          {avatarOrDefault(avatar)}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{name}</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: CLAY,
            }}
          >
            30-Day Challenge
          </div>
        </div>
      </div>

      {/* plant hero */}
      <div
        style={{
          margin: "26px 0",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 76, lineHeight: 1 }}>{plant.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>
          {progress.finished ? "Completed all 30 days!" : plant.title}
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "flex", gap: 10 }}>
        <Stat
          label="day"
          value={
            progress.finished
              ? `${CHALLENGE.days}/${CHALLENGE.days}`
              : `${progress.consumedDays}/${CHALLENGE.days}`
          }
        />
        <Stat label="points" value={`${progress.points}`} />
        <Stat label="streak" value={streak > 0 ? `🔥${streak}` : "—"} />
        <Stat label="of max" value={`${progress.pct}%`} />
      </div>

      {/* progress bar */}
      <div
        style={{
          marginTop: 20,
          height: 12,
          borderRadius: 999,
          background: "#0000000f",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.round(((progress.consumedDays || 0) / CHALLENGE.days) * 100)}%`,
            background: progress.finished ? SAGE : CLAY,
            borderRadius: 999,
          }}
        />
      </div>

      {/* footer */}
      <div
        style={{
          marginTop: 22,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#2a262288",
        }}
      >
        <span>
          future me <span style={{ color: CLAY }}>says thanks</span>
        </span>
        <span>
          since {MONTH_NAMES[start.getMonth()].slice(0, 3)} {start.getDate()}
        </span>
      </div>
    </div>
  );
});

export default RecapCard;
