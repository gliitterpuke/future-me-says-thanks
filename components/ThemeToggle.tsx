"use client";

import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const ORDER: Mode[] = ["system", "light", "dark"];
const ICON: Record<Mode, string> = { system: "🖥️", light: "☀️", dark: "🌙" };
const LABEL: Record<Mode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches !== false
  );
}

function applyMode(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && systemPrefersDark());
  const el = document.documentElement;
  el.classList.toggle("dark", dark);
  el.style.colorScheme = dark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  // Sync from storage on mount.
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Mode) || "system";
    setMode(stored);
    applyMode(stored);
  }, []);

  // When following the system, react to OS changes live.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyMode("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);
    applyMode(next);
  }

  return (
    <button
      onClick={cycle}
      title={`Theme: ${LABEL[mode]}`}
      aria-label={`Theme: ${LABEL[mode]}. Tap to change.`}
      className="rounded-full border border-ink/15 px-2.5 py-1 text-xs text-ink/60 transition hover:border-ink/30"
    >
      <span className="mr-1">{ICON[mode]}</span>
      {LABEL[mode]}
    </button>
  );
}
