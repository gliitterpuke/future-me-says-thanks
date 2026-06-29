// Rotating daily microcopy. Pick deterministically from the calendar day so
// everyone sees the same line on a given day, and it changes each day.
export const AFFIRMATIONS = [
  "future you says thanks 💪",
  "small reps, big you ✨",
  "show up, that's the whole trick 🌱",
  "one good day stacks on the last 🧱",
  "your body is keeping score (nicely) 📈",
  "discipline is a love language 💌",
  "be the friend who logged it 😌",
  "tiny wins, daily 🐢",
  "you vs. you. you're winning 🏆",
  "rest counts too — but move first 🚶",
  "the streak wants to live 🔥",
  "consistency > intensity ⚖️",
  "drink water, log points, repeat 💧",
  "proud of you already 🥹",
  "make future-you a little jealous 😏",
];

// Days since an arbitrary epoch → index. Stable for a given date.
export function affirmationForDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const days = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return AFFIRMATIONS[((days % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length];
}
